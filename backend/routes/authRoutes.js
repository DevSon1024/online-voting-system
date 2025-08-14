/*
* backend/routes/authRoutes.js
* Handles user registration and login.
*/

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authRouter = express.Router();

// Multer setup for photo uploads
const uploadDir = 'uploads/photos/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });

// POST /api/auth/register
authRouter.post('/register', upload.single('photo'), async (req, res) => {
    const { name, email, password, role, city, state, dob } = req.body;
    const photoUrl = req.file ? `/uploads/photos/${req.file.filename}` : null;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'voter',
            city,
            state,
            dob,
            photoUrl,
            validated: false // Set validated to false by default
        });

        await user.save();

        res.status(201).json({ msg: 'Registration successful. Please wait for admin validation.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (!user.validated) {
            return res.status(401).json({ msg: 'Your account has not been validated by an administrator yet.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req, res) => {
    // In a real application, you would handle the password reset logic here,
    // such as generating a reset token and sending an email to the user.
    // For now, this is a placeholder.
    res.status(200).json({ msg: 'Password reset request received. Please check your email.' });
});

module.exports = authRouter;