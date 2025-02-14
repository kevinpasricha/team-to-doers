require("dotenv").config();

const express = require("express");
// Database
const mysql = require("mysql");
// Session based
const session = require("express-session");
// Hashing
const bcrypt = require("bcryptjs");

const bodyParser = require("body-parser");

const cors = require("cors");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // React frontend
    credentials: true, // Allow cookies
  })
);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("CONNECTED TO DATABASE!");
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username == "" || password == "")
    return res.status(400).send("Missing fields");

  db.query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username],
    (err, results) => {
      if (err) return res.status(500).send("Database Error");
      if (results.length === 0)
        return res.status(400).send("Invalid Credentials");

      const user = results[0];

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) return res.status(500).send("Error checking password");
        if (!match) return res.status(400).send("Invalid Credentials");

        req.session.user = { id: user.id, username: user.username };
        res.redirect("/dashboard");
      });
    }
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Logged out successfully!");
  });
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.status(403).send("Not authenticated");
  res.send(`Welcome, ${req.session.username}!`);
});

app.listen(5000, () => console.log("Server running on port 5000"));
