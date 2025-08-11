const express = require('express');
const { User } = require('../models/User');
const { Vote } = require('../models/Vote');
const { authMiddleware } = require('../middleware/authMiddleware');

const userRouter = express.Router();

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
userRouter.put('/profile', authMiddleware, async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;

        await user.save();
        res.json(user);
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
