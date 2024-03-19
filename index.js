const express = require("express")
const cors = require("cors");
const app = express()
app.use(cors(
  {
      origin: "*",
  }
));
const mysql = require("mysql")
require("dotenv").config()
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const port = process.env.PORT
const db = mysql.createPool({
   connectionLimit: 100,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT
})
db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB conneted successful: " + connection.threadId)
})
app.get("/check", (req, res) => {
    res.send("Hello World")
})
//inserting into data
app.post('/addData', (req, res) => {
    const { username, stdin, language, sourcecode,timestamp } = req.body;
  
    // Check if all required fields are provided
    if (!username || !stdin || !language || !sourcecode) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    // Insert data into the database
    const sql = 'INSERT INTO usertable (username, stdin, language, sourcecode,timestamp) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [username, stdin, language, sourcecode,timestamp], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      console.log('Data inserted successfully');
      res.status(200).json({ message: 'Data inserted successfully' });
    });
  });
  //getting data from db
  app.get('/getData', (req, res) => {
    const sql = 'SELECT * FROM usertable';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.status(200).json(result);
    });
  })

app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))