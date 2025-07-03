// backend/server.js

const express = require('express');
const cors = require('cors');   // CrossOriginResourceSharing
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(bodyParser.json()); // Parse JSON Request bodies

let capturedData = null; // Variable to store captured node data

app.post('/capture', (req, res) => {
    const { text, url, title } = req.body;
    console.log('Received capture request:', { text, url, title });

    // Storing the captured data
    capturedData = {
        text: text || '',
        url: url || '',
        title: title || '',
        timestamp: Date.now()
    };
    res.status(200).json({
        message: 'Node captured successfully',
        data: capturedData
    });
});

app.get('/get-capture', (req, res) => {
    if (capturedData){
        res.status(200).json({ capturedData });
        capturedData = null; // Clear the captured data after sending it
    }else{
        res.status(204).send(); // No content
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// This server will handle requests from the frontend to capture node data
// and provide it back when requested. It uses CORS to allow requests from the frontend app
// and body-parser to parse JSON request bodies.
// The captured data is stored in memory and cleared after being sent to the frontend.