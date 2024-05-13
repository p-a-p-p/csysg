const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const XLSX = require("xlsx");

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

app.delete("/deleteEvent/:eventId", (req, res) => {
  const eventId = req.params.eventId;
  pool.query(
    "DELETE FROM event_table WHERE eventID = ?",
    [eventId],
    (err, results) => {
      if (err) {
        console.error("Error", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json({ message: "Event deleted successfully" });
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

// app.get("/availableEvents", (req, res) => {
//   pool.query(
//     "SELECT eventID, eventName, eventDate FROM event_table",
//     (err, results) => {
//       if (err) {
//         console.error("Error", err);
//       }
//       res.status(200).json(results);
//       console.log(results);
//     }
//   );
// });

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

app.post("/importExcel", (req, res) => {
  const filePath = req.body.filePath;
  importExcelToMySQL(filePath);
  res.send("Import process started.");
});

// app.get("/loadAttendance/:eventID", (req, res) => {
//   const eventID = req.params.eventID;
//   console.log(eventID); // Log the extracted eventID for debugging

//   pool.query(
//     "SELECT * FROM attendance_table INNER JOIN event_table ON attendance_table.eventID = event_table.eventID WHERE eventID = ?",
//     [eventID],
//     (err, results) => {
//       if (err) {
//         console.error("Error executing SQL query:", err);
//         res.status(500).json({ error: "Internal server error" }); // Send an error response
//       } else {
//         console.log("Query results:", results); // Log the query results for debugging
//         res.status(200).json(results); // Send the query results as JSON response
//       }
//     }
//   );
// });

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Authenticate user (replace with your authentication logic)
  if (username === "admin" && password === "admin") {
    res.redirect("events.html");
    console.log(req.body);
  } else {
    res.status(401).send("Invalid username or password");
    console.log(req.body);
  }
});

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/importExcel", (req, res) => {
  const filePath = req.body.filePath;

  // Read the Excel file
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const worksheet = workbook.Sheets[sheetName];
  const excelData = xlsx.utils.sheet_to_json(worksheet);

  // Process each row of Excel data and insert into MySQL database
  excelData.forEach((row) => {
    const idNumber = row.idNumber;
    const eventID = row.eventID;

    // Insert the data into the MySQL table
    pool.query(
      "INSERT INTO attendance_table (idNumber, eventID) VALUES (?, ?)",
      [idNumber, eventID],
      (err, results) => {
        if (err) {
          console.error("Error inserting row:", err);
        } else {
          console.log("Row inserted successfully:", results);
        }
      }
    );
  });
});

app.post("/importAttendance", (req, res) => {
  const attendanceData = req.body;

  // Validate and insert data into MySQL attendance table
  // Code for inserting data into MySQL goes here

  res.status(200).send("Data imported successfully.");
});
