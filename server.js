const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const xlsx = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection configuration
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydb",
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// Define a route to handle saving events
app.post("/saveEvent", (req, res) => {
  const { eventName, eventDate } = req.body;
  pool.query(
    "INSERT INTO event_table (`eventName`, `eventDate`) VALUES (?, ?)",
    [eventName, eventDate],
    (err, results) => {
      if (err) {
        console.error("Error", err);
      }
      res.status(200).json(results);
    }
  );
});

app.delete("/deleteEvent/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "DELETE FROM event_table WHERE eventID = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Row not found" });
      }
      res.status(200).json({ message: "Row deleted successfully" });
    }
  );
});

app.get("/availableEvents", (req, res) => {
  pool.query(
    "SELECT eventID, eventName, eventDate FROM event_table",
    (err, results) => {
      if (err) {
        console.error("Error", err);
      }
      res.status(200).json(results);
      console.log(results);
    }
  );
});

app.post("/addStudent", (req, res) => {
  const { eventName, eventDate } = req.body;
  pool.query(
    "INSERT INTO event_table (`eventName`, `eventDate`) VALUES (?, ?)",
    [eventName, eventDate],
    (err, results) => {
      if (err) {
        console.error("Error", err);
      }
      res.status(200).json(results);
    }
  );
});

app.get("/loadAttendance/:eventID", (req, res) => {
  const eventID = req.params.eventID;
  console.log(eventID);
  pool.query(
    "SELECT * FROM attendance_table INNER JOIN event_table ON attendance_table.eventID = event_table.eventID WHERE attendance_table.eventID = ?",
    [eventID],
    (err, results) => {
      if (err) {
        console.error("Error", err);
      }
      res.status(200).json(results);
      console.log(results);
    }
  );
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "admin" && password === "admin") {
    res.redirect("events.html");
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.post("/addAttendance", (req, res) => {
  const { idNumber, eventID } = req.body;
  pool.query(
    "INSERT INTO attendance_table (idNumber, eventID) VALUES (?, ?)",
    [idNumber, parseInt(eventID)],
    (err, results) => {
      if (err) {
        console.error("Error", err);
      }
      res.status(200).json(results);
    }
  );
});

app.post("/importAttendance", (req, res) => {
  const attendanceData = req.body;

  const values = attendanceData.map(({ idNumber, eventID }) => [
    idNumber,
    parseInt(eventID),
  ]);

  const query = "INSERT INTO attendance_table (idNumber, eventID) VALUES ?";

  pool.query(query, [values], (err, results) => {
    if (err) {
      console.error("Error", err);
      return res.status(500).send("Error inserting data");
    }
    res.status(200).json(results);
  });
});

app.get("/exportData/:eventID", (req, res) => {
  const { eventID } = req.params;
  pool.query(
    "SELECT idNumber, eventName FROM attendance_table INNER JOIN event_table ON attendance_table.eventID = event_table.eventID WHERE attendance_table.eventID = ?",
    [eventID],
    (err, results) => {
      if (err) {
        console.error("Error", err);
      }

      var workbook = xlsx.utils.book_new();

      var worksheet = xlsx.utils.json_to_sheet(results);
      xlsx.utils.book_append_sheet(workbook, worksheet, "BOYSHEET");

      const buf = xlsx.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.attachment("shetboy.xlsx");
      res.status(200).end(buf);
    }
  );
});

app.get("/searchStudent/:idNumber", (req, res) => {
  const idNumber = req.params.idNumber;

  pool.query(
    `SELECT studentName FROM student_table WHERE idNumber = ?`,
    [idNumber],
    (err, studentResults) => {
      if (err) {
        console.error("Error fetching student name:", err);
        return res.status(500).send("Internal Server Error");
      }

      if (studentResults.length === 0) {
        return res.status(404).send("Student not found");
      }

      const studentName = studentResults[0].studentName;

      pool.query(
        `SELECT event_table.eventName, event_table.eventDate 
         FROM attendance_table 
         INNER JOIN event_table 
         ON attendance_table.eventID = event_table.eventID 
         WHERE attendance_table.idNumber = ?`,
        [idNumber],
        (err, eventResults) => {
          if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).send("Internal Server Error");
          }

          res.status(200).json({ studentName, events: eventResults });
        }
      );
    }
  );
});

// server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
