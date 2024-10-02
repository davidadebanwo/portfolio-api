const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON data

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { }).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// Message Schema
const messageSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Route to handle form submission
app.post('/api/contact', async (req, res) => {
    console.log(req.body);
    const { firstname, lastname, email, message } = req.body;

    // Save the message to the database
    const newMessage = new Message({ firstname, lastname, email, message });
    await newMessage.save();

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com', // Zoho SMTP server
        port: 465, // For SSL
        secure: true, // Set to true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your Zoho email
            pass: process.env.EMAIL_PASS  // Your Zoho email password or app password
        },
        tls: {
            rejectUnauthorized: false // Accept self-signed certificates
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Contact Form Message',
        text: `You have received a new message from ${firstname} ${lastname} (${email}):\n\n${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            return res.status(500).json({ error: 'Failed to send email' });            
        }
        res.status(200).json({ message: 'Message sent and saved successfully' });
    });
});

// Start server
const PORT=process.env.PORT || 2000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});