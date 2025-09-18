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
// Serve static files with explicit MIME types
app.use('/css', express.static(path.join(__dirname, 'client/css'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'text/css');
    }
}));

app.use('/js', express.static(path.join(__dirname, 'client/js'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'application/javascript');
    }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve other static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soundalt')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sounds', require('./routes/sounds'));

// Page Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'register.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'upload.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'profile.html'));
});

// Catch all handler for the home page
app.get('*', (req, res) => {
  // Add error handling for file serving
  const indexPath = path.join(__dirname, 'client', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error loading page');
    }
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;
