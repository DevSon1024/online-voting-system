// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models/User');

const authRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/photos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST /api/auth/register
authRouter.post('/register', upload.single('photo'), async (req, res) => {
    const { name, email, password, role, city, state, dob } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password || !city || !state || !dob) {
            return res.status(400).json({ 
                msg: 'Please provide all required fields: name, email, password, city, state, and date of birth' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Please provide a valid email address' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        // Validate date of birth
        const dobDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 18) {
            return res.status(400).json({ msg: 'You must be at least 18 years old to register' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Handle photo URL if file was uploaded
        let photoUrl = null;
        if (req.file) {
            photoUrl = `/uploads/photos/${req.file.filename}`;
        }

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'voter',
            city,
            state,
            dob: dobDate,
            photoUrl,
            validated: false
        });

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    validated: user.validated
                },
                msg: 'Registration successful! Please wait for admin validation.'
            });
        });

    } catch (err) {
        console.error('Registration error:', err.message);
        
        // Clean up uploaded file if there was an error
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
            });
        }
        
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        
        res.status(500).json({ msg: 'Server error during registration' });
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        if (user.validationStatus === 'rejected') {
            return res.status(401).json({ msg: `Your registration has been rejected. Reason: ${user.rejectionReason}`, validationStatus: user.validationStatus, userEmail: user.email });
        }

        if (!user.validated) {
            return res.status(401).json({ msg: 'Admin has not approved your request' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, validationStatus: user.validationStatus, rejectionReason: user.rejectionReason });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/resubmit
authRouter.post('/resubmit', upload.single('photo'), async (req, res) => {
    const { name, email, password, city, state, dob } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update user fields
        user.name = name;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        user.city = city;
        user.state = state;
        user.dob = new Date(dob);
        if (req.file) {
            user.photoUrl = `/uploads/photos/${req.file.filename}`;
        }
        
        // Update validation status
        user.validationStatus = 'resubmitted';
        user.rejectionReason = undefined;

        await user.save();

        res.json({ msg: 'Your application has been resubmitted successfully. Please wait for admin validation.' });

    } catch (err) {
        console.error('Resubmission error:', err.message);
        res.status(500).json({ msg: 'Server error during resubmission' });
    }
});

module.exports = authRouter;