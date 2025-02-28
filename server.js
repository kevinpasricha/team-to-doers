require("dotenv").config();

const express = require("express");
// Database
const mysql = require("mysql2");
// Session based
const session = require("express-session");
// Hashing
const bcrypt = require("bcryptjs");

const bodyParser = require("body-parser");

const cors = require("cors");

const { isValidEmail, isValidPassword } = require("./utils/validation");

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

/**
 * Handles login,
 * Takes in username and password, makes sure user exists, and confirms passwords match
 *
 * @param {Object} req - The request object containing user details.
 * @param {Object} res - The response object to send the result.
 */

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).send("Missing fields");

  db.query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username],
    (err, results) => {
      if (err) return res.status(500).send("Database Error");
      if (results.length === 0)
        return res.status(400).send("Invalid Credentials user");

      const user = results[0];

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) return res.status(500).send("Error checking password");
        if (!match) return res.status(400).send("Invalid Credentials password");

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

/**
 * Handles user registration by validating inputs, hashing the password,
 * and saving the user to the database.
 *
 * @param {Object} req - The request object containing user details.
 * @param {Object} res - The response object to send the result.
 */
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("All fields are required.");
  }

  if (!isValidEmail(email)) {
    return res.status(400).send("Invalid Format.");
  }

  if (!isValidPassword(password)) {
    return res.status(400).send("Password must be at least 8 characters long.");
  }

  db.query(
    "SELECT username FROM users WHERE username = ? LIMIT 1",
    [username],
    (err, results) => {
      if (err) return res.status(500).send("Database Error");

      if (results.length > 0)
        return res.status(400).send("Username is already taken.");

      db.query(
        "SELECT email FROM users WHERE email = ? LIMIT 1",
        [email],
        (err, results) => {
          if (err) return res.status(500).send("Database Error");

          if (results.length > 0)
            return res.status(400).send("Email already registered.");

          bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).send("Error hashing password");

            db.query(
              "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
              [username, email, hash],
              (err) => {
                if (err) return res.status(500).send("Error registering user");
                res.status(201).send("User registered successfully");
              }
            );
          });
        }
      );
    }
  );
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.status(403).send("Not authenticated");

  res.send(`Welcome, ${req.session.user.username}!`);
});

app.get("/todos", (req, res) => {
  if (!req.session.user) return res.status(403).send("Not authenticated");

  const { id } = req.session.user;

  db.query(
    "SELECT title, description, dueDate FROM todos WHERE userID = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).send("Database Error");

      res.json(results);
    }
  );
});

app.post("/todos", (req, res) => {
  if (!req.session.user) return res.status(403).send("Not authenticated");
  const { id } = req.session.user;
  const { title, description, dueDate } = req.body;

  if (!title || !description || !dueDate) {
    return res.status(400).send("All fields are required");
  }

  db.query(
    "INSERT INTO todos (title, description, dueDate, userID) VALUES (?, ?, ?, ?)",
    [title, description, dueDate, id],
    (err, results) => {
      if (err) return res.status(500).send("Database Error");

      const newTodo = { id: results.insertId, title, description, dueDate };
      res.status(200).json(newTodo);
    }
  );
});

module.exports = app;

// Start the server only if not in testing mode
if (require.main === module) {
  app.listen(5000, () => console.log("Server running on port 5000"));
}
