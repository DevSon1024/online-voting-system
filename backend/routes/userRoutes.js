const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models/User');
const { Vote } = require('../models/Vote');
const { authMiddleware } = require('../middleware/authMiddleware');

const userRouter = express.Router();

// Multer setup for photo uploads
const uploadDir = path.join(__dirname, '..', 'uploads/photos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `user-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });


// GET /api/user/profile (Get current user's profile)
userRouter.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/user/profile (Update current user's profile)
userRouter.put('/profile', [authMiddleware, upload.single('photo')], async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update text fields from req.body
        const { name, email, state, city, dob } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (state) user.state = state;
        if (city) user.city = city;
        if (dob) user.dob = dob;

        // Update photo if a new one is uploaded
        if (req.file) {
            user.photoUrl = `/uploads/photos/${req.file.filename}`;
        }

        await user.save();
        
        // Return user data without the password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/user/profile (Delete current user's account)
userRouter.delete('/profile', authMiddleware, async (req, res) => {
    try {
        // Also delete user's votes
        await Vote.deleteMany({ voter: req.user.id });
        await User.findByIdAndDelete(req.user.id);

        res.json({ msg: 'User and associated votes deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/user/voted-elections
userRouter.get('/voted-elections', authMiddleware, async (req, res) => {
    try {
        const votes = await Vote.find({ voter: req.user.id }).select('election');
        const electionIds = votes.map(vote => vote.election);
        res.json(electionIds);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/user/vote-details/:electionId
userRouter.get('/vote-details/:electionId', authMiddleware, async (req, res) => {
    try {
        const electionId = req.params.electionId;
        const vote = await Vote.findOne({ 
            voter: req.user.id, 
            election: electionId 
        }).populate({
            path: 'candidate',
            populate: {
                path: 'party',
                model: 'Party'
            }
        });
        
        if (!vote) {
            return res.status(404).json({ msg: 'Vote not found' });
        }
        
        res.json({
            candidateId: vote.candidate._id,
            candidateName: vote.candidate.name,
            candidateParty: vote.candidate.party.name,
            votedAt: vote.createdAt
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = userRouter;