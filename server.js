const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint for lead capture
app.post('/api/leads', (req, res) => {
    const { name, phone, exam, message, formType } = req.body;
    
    // In a real application, you'd save this to a database or send an email.
    console.log(`--- New Lead Captured (${formType}) ---`);
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Exam: ${exam}`);
    if (message) console.log(`Message: ${message}`);
    console.log('-------------------------');

    res.status(200).json({ success: true, message: 'Lead captured successfully!' });
});

// Fallback to index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
