/*
* backend/server.js
* Main entry point for the backend server.
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const voteRoutes = require('./routes/voteRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// ADD THIS LINE to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// --- Serve static files for logos and photos ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads/photos')));

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/online-voting-system';

// The deprecated options have been removed from this call
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));


// --- API Routes ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Online Voting System API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api', voteRoutes);


// --- Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});