const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

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
  console.log(req.body);
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

// Route to handle user authentication
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

app.get("");

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
