const express = require("express")
const cors = require("cors");
const axios = require('axios');
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
  app.get('/getDataById',(req,res)=>{
    const {id} = req.body;
    const sql = 'select * from usertable where id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error fetching in data:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      console.log('Data fecthed successfully');
      res.status(200).json(result);
    });
  })
  //execution phase
  app.post('/uploadSourceCode', async (req, res) => {
    const { sourcecode, language, stdin } = req.body;
    
    // Define a function to map language names to language IDs
    const languageDecoder = (language) => {
        switch (language) {
            case "java":
                return 62;
            case "c++":
                return 54;
            case "python":
                return 71;
            case "javascript":
                return 63;
            default:
                return null; // Return null for unsupported languages
        }
    };

    // Determine the language ID based on the language name
    const languageId = languageDecoder(language);

    // Check if the language is supported
    if (languageId === null) {
        return res.status(400).json({ message: 'Unsupported language' });
    }

    // Options for the Axios request to Judge0 API
    const judge0Options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: {
            base64_encoded: true,
            fields: '*'
        },
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            'X-RapidAPI-Host': process.env.RAPID_API_HOST
        },
        data: {
            language_id: languageId,
            source_code: sourcecode,
            stdin: stdin
        }
    };

    try {
        // Make the Axios request to Judge0 API
        const judge0Response = await axios.request(judge0Options);
        
        // Extract data from Judge0 API response
        const judge0Data = judge0Response.data;
        const token = judge0Data.token
        
        // Now you can construct the payload for the new request using judge0Data
        
        // Example: Constructing options for the new Axios request
        const newRequestOptions = {
            method: 'GET',
            url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            headers: {
              'X-RapidAPI-Key': process.env.RAPID_API_KEY,
              'X-RapidAPI-Host': process.env.RAPID_API_HOST
            },

        };

        // Make the new Axios request
        const newResponse = await axios.request(newRequestOptions);

        // Send the response from the new endpoint back to the client
        res.status(200).json(newResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))