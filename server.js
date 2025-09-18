const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client'));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soundalt')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sounds', require('./routes/sounds'));

// Page Routes
app.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'register.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'upload.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'profile.html'));
});

// Catch all handler for the home page
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;
