
// Order
// Import Statements: Import all required modules/packages.
// Variable Initializations: Set up your initial variables, like the tasks arrays.
// Database Connection: Create the MySQL connection.
// Middleware: Set up any middlewares (app.use()).
// Route Handlers: Define your routes (app.get(), app.post(), etc.).

import express from "express";
import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.MY_SQL_PASSWORD,
  database: 'todolist'
});

// Attempt to connect to the database
connection.connect(err => {
  if (err) throw err;
  console.log("Connected to the MySQL server.");
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL!");

  connection.query("CREATE DATABASE IF NOT EXISTS todolist", function(err, result) {
    if (err) throw err;
    console.log("Database 'todolist' created or already exists.");

    connection.changeUser({database: 'todolist'}, function(err) {
      if (err) throw err;

      // Updated table schema to include 'completed' column
      let tasksTable = `CREATE TABLE IF NOT EXISTS tasks (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            description VARCHAR(255) NOT NULL,
                            completed BOOLEAN DEFAULT FALSE
                          )`;

      connection.query(tasksTable, function(err, result) {
        if (err) throw err;
        console.log("Table 'tasks' created or already exists.");

        let workTasksTable = `CREATE TABLE IF NOT EXISTS work_tasks (
                                  id INT AUTO_INCREMENT PRIMARY KEY,
                                  description VARCHAR(255) NOT NULL,
                                  completed BOOLEAN DEFAULT FALSE
                                )`;

        connection.query(workTasksTable, function(err, result) {
          if (err) throw err;
          console.log("Table 'work_tasks' created or already exists.");
        });
      });
    });
  });
});

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  res.locals.today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', 
      month: 'long', 
      day: 'numeric'
  });
  next();
});

// Fetching the entire task object now, including 'completed' status
app.get("/", (req, res) => {
  connection.query('SELECT * FROM tasks', (error, results) => {
    if (error) return console.error("Error fetching tasks:", error);
    res.render("index.ejs", { tasks: results });
  });
});

app.post("/submit", (req, res) => {
  const newTask = req.body.newItem;
  connection.query('INSERT INTO tasks (description) VALUES (?)', [newTask], (error, results) => {
    if (error) {
      console.error("Error inserting task:", error);
      return res.status(500).send('An error occurred.');
    }
    res.sendStatus(200);
  });
});

app.get("/work", (req, res) => {
  connection.query('SELECT * FROM work_tasks', (error, results) => {
    if (error) return console.error("Error fetching work tasks:", error);
    res.render("work.ejs", { workTasks: results });
  });
});

app.post("/work/submit", (req, res) => {
  const newTask = req.body.newItem;
  connection.query('INSERT INTO work_tasks (description) VALUES (?)', [newTask], (error, results) => {
    if (error) {
      console.error("Error inserting work task:", error);
      return res.status(500).send('An error occurred.');
    }
    res.sendStatus(200);
  });
});

app.delete("/delete", (req, res) => {
  const itemToDelete = req.body.itemToDelete;
  connection.query('DELETE FROM tasks WHERE description = ?', [itemToDelete], (error, results) => {
    if (error) {
      console.error("Error deleting task:", error);
      return res.status(500).send('An error occurred while deleting.');
    }
    res.status(200).send('Successfully deleted.');
  });
});

app.delete("/work/delete", (req, res) => {
  const itemToDelete = req.body.itemToDelete;
  console.log(itemToDelete);
  connection.query('DELETE FROM work_tasks WHERE description = ?', [itemToDelete], (error, results) => {
      if (error) {
          console.error("Error deleting work task:", error);
          res.status(500).send('An error occurred while deleting.');
          return;
      }
      if (results.affectedRows === 0) {
          res.status(404).send('Task not found.');
          return;
      }
      res.status(200).send('Successfully deleted.');
  });
});


// Toggle completion for regular tasks
app.post("/toggle-completion", (req, res) => {
  const { description, completed } = req.body;
  // Convert string to boolean for safe DB operations
  const isCompleted = completed === 'true' ? 1 : 0;  // 1 for true and 0 for false, for MySQL
 
  connection.query('UPDATE tasks SET completed = ? WHERE description = ?', [isCompleted, description], (error, results) => {
      if (error) {
          console.error("Error updating task completion status:", error);
          return res.status(500).send('Error updating completion status.');
      }
      res.status(200).send('Successfully updated.');
  });
});

// Toggle completion for work tasks
app.post("/work/toggle-completion", (req, res) => {
  const { description, completed } = req.body;
  const isCompleted = completed === 'true' ? 1 : 0; // 1 for true and 0 for false, for MySQL
  
  connection.query('UPDATE work_tasks SET completed = ? WHERE description = ?', [isCompleted, description], (error, results) => {
      if (error) {
          console.error("Error updating work task completion status:", error);
          return res.status(500).send('Error updating completion status.');
      }
      res.status(200).send('Successfully updated.');
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

