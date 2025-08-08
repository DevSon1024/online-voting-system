/*
* backend/routes/adminRoutes.js
* Routes for admin-only actions.
*/
const express = require('express');
const multer = require('multer');
const path = require('path'); // Correct
const fs = require('fs'); // 1. Import the 'fs' module
const { Election } = require('../models/Election');
const { Candidate } = require('../models/Candidate');
const { Vote } = require('../models/Vote');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');


const adminRouter = express.Router();

// --- Multer setup for file uploads ---
const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Multer setup for file uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// --- Elections CRUD ---

// POST /api/admin/elections (Create) - No changes needed here
// POST /api/admin/elections (Create)
adminRouter.post('/elections', [authMiddleware, adminMiddleware], async (req, res) => {
    const { title, description, electionLevel, electionType, state, city, startDate, endDate } = req.body;
    try {
        const newElection = new Election({ title, description, electionLevel, electionType, state, city, startDate, endDate });
        const election = await newElection.save();
        res.json(election);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/elections/:id (Update) - No changes needed here
adminRouter.put('/elections/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!election) return res.status(404).json({ msg: 'Election not found' });
        res.json(election);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/admin/elections/:id (Delete) - CORRECTED
adminRouter.delete('/elections/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ msg: 'Election not found' });
        }
        
        // Also delete related candidates and votes
        await Candidate.deleteMany({ election: req.params.id });
        await Vote.deleteMany({ election: req.params.id });
        
        // **FIX**: Use deleteOne() instead of remove()
        await election.deleteOne();

        res.json({ msg: 'Election and all related data removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Candidates CRUD ---

// POST /api/admin/candidates (Create) - No changes needed here
adminRouter.post('/candidates', [authMiddleware, adminMiddleware], async (req, res) => {
    const { name, partyId, electionId } = req.body;
    try {
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ msg: 'Election not found' });

        const newCandidate = new Candidate({ name, party: partyId, election: electionId });
        const candidate = await newCandidate.save();

        election.candidates.push(candidate._id);
        await election.save();

        res.json(candidate);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/candidates/:id (Update) - No changes needed here
adminRouter.put('/candidates/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!candidate) return res.status(404).json({ msg: 'Candidate not found' });
        res.json(candidate);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/admin/candidates/:id (Delete) - CORRECTED
adminRouter.delete('/candidates/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ msg: 'Candidate not found' });
        }
        
        // Remove from the election's candidate list
        await Election.updateOne({ _id: candidate.election }, { $pull: { candidates: candidate._id } });
        
        // **FIX**: Use deleteOne() instead of remove()
        await candidate.deleteOne();

        res.json({ msg: 'Candidate removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/election-results/:electionId (Get detailed election results with voter info)
adminRouter.get('/election-results/:electionId', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const { User } = require('../models/User');
        const electionId = req.params.electionId;
        
        // Get election details
        const election = await Election.findById(electionId).populate('candidates');
        if (!election) {
            return res.status(404).json({ msg: 'Election not found' });
        }
        
        // Get vote results with candidate details
        const results = await Vote.aggregate([
            { $match: { election: new mongoose.Types.ObjectId(electionId) } },
            { $group: { _id: '$candidate', count: { $sum: 1 } } },
            { $lookup: { from: 'candidates', localField: '_id', foreignField: '_id', as: 'candidateDetails' } },
            { $unwind: '$candidateDetails' },

            { $lookup: { from: 'parties', localField: 'candidateDetails.party', foreignField: '_id', as: 'partyDetails' } },
            { $unwind: '$partyDetails' },

            { $project: { 
                _id: 0, 
                candidateId: '$_id', 
                name: '$candidateDetails.name', 
                party: '$partyDetails.party', 
                votes: '$count' } }
        ]);
        
        // Get voter details
        const voterDetails = await Vote.find({ election: electionId })
            .populate('voter', 'name email')
            .populate('candidate', 'name party')
            .sort({ createdAt: -1 });
        
        const voters = voterDetails.map(vote => ({
            voterName: vote.voter.name,
            voterEmail: vote.voter.email,
            candidateName: vote.candidate.name,
            candidateParty: vote.candidate.party,
            votedAt: vote.createdAt || new Date()
        }));
        
        res.json({
            election: {
                title: election.title,
                description: election.description,
                startDate: election.startDate,
                endDate: election.endDate
            },
            results,
            voters,
            totalVotes: voters.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const { Party } = require('../models/Party'); // Import the new Party model

// --- Party Management ---

// POST /api/admin/parties (Create a new party)
adminRouter.post('/parties', [authMiddleware, adminMiddleware, upload.single('logo')], async (req, res) => {
    const { name, level } = req.body;
    // req.file will be populated by multer if a file was uploaded
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const newParty = new Party({ name, level, logoUrl });
        const party = await newParty.save();
        res.status(201).json(party);
    } catch (err) {
        console.error("Error creating party:", err.message);
        // Provide a more specific error if it's a duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'A party with this name already exists.' });
        }
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/parties (Get all parties)
adminRouter.get('/parties', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const parties = await Party.find();
        res.json(parties);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/parties/:id (Update)
adminRouter.put('/parties/:id', [authMiddleware, adminMiddleware, upload.single('logo')], async (req, res) => {
    const { name, level } = req.body;
    const partyId = req.params.id;

    try {
        let party = await Party.findById(partyId);
        if (!party) {
            return res.status(404).json({ msg: 'Party not found' });
        }

        // Prepare update data
        const updateData = { name, level };
        if (req.file) {
            updateData.logoUrl = `/uploads/${req.file.filename}`;
            // Optional: Delete the old logo file if it exists
            if (party.logoUrl) {
                fs.unlink(path.join(__dirname, '..', party.logoUrl), err => {
                    if (err) console.error("Error deleting old logo:", err);
                });
            }
        }

        party = await Party.findByIdAndUpdate(partyId, { $set: updateData }, { new: true });
        res.json(party);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/admin/parties/:id (Delete)
adminRouter.delete('/parties/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const party = await Party.findById(req.params.id);
        if (!party) {
            return res.status(404).json({ msg: 'Party not found' });
        }

        // Optional: Delete logo file from server
        if (party.logoUrl) {
            fs.unlink(path.join(__dirname, '..', party.logoUrl), err => {
                if (err) console.error("Error deleting logo:", err);
            });
        }

        await party.deleteOne();
        res.json({ msg: 'Party removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = adminRouter;