/*
* backend/routes/voteRoutes.js
* Handles voting and results.
*/

const express = require('express');
const mongoose = require('mongoose');
const { Election } = require('../models/Election');
const { Vote } = require('../models/Vote');
const { authMiddleware } = require('../middleware/authMiddleware');

const voteRouter = express.Router();

// GET /api/elections (Get all elections) - No changes
voteRouter.get('/elections', async (req, res) => {
    try {
        const elections = await Election.find().populate('candidates').sort({ startDate: -1 });
        res.json(elections);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/vote/:electionId (Cast a vote) - No changes
voteRouter.post('/vote/:electionId', authMiddleware, async (req, res) => {
    const { candidateId } = req.body;
    const electionId = req.params.electionId;
    const voterId = req.user.id;

    try {
        const existingVote = await Vote.findOne({ voter: voterId, election: electionId });
        if (existingVote) {
            return res.status(400).json({ msg: 'You have already voted in this election.' });
        }
        const newVote = new Vote({ voter: voterId, candidate: candidateId, election: electionId });
        await newVote.save();
        res.json({ msg: 'Vote cast successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/results/:electionId (Get election results) - No changes
voteRouter.get('/results/:electionId', async (req, res) => {
    try {
        const electionId = req.params.electionId;
        const results = await Vote.aggregate([
            { $match: { election: new mongoose.Types.ObjectId(electionId) } },
            { $group: { _id: '$candidate', count: { $sum: 1 } } },
            { $lookup: { from: 'candidates', localField: '_id', foreignField: '_id', as: 'candidateDetails' } },
            { $unwind: '$candidateDetails' },
            { $project: { _id: 0, candidateId: '$_id', name: '$candidateDetails.name', party: '$candidateDetails.party', votes: '$count' } }
        ]);
        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// **NEW ROUTE**
// GET /api/user/voted-elections (Get IDs of elections user has voted in)
voteRouter.get('/user/voted-elections', authMiddleware, async (req, res) => {
    try {
        // Find all votes by the current user
        const votes = await Vote.find({ voter: req.user.id }).select('election');
        // Return an array of just the election IDs
        const electionIds = votes.map(vote => vote.election);
        res.json(electionIds);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = voteRouter;