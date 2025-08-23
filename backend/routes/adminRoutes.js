const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // Import bcryptjs
const { Election } = require('../models/Election');
const { Candidate } = require('../models/Candidate');
const { Vote } = require('../models/Vote');
const { Party } = require('../models/Party');
const { User } = require('../models/User'); 
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const adminRouter = express.Router();

// Multer setup remains the same...
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });


// --- User Management ---

// GET /api/admin/users (Get all users)
adminRouter.get('/users', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const users = await User.find({ validated: true }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/user/:id (Get single user by ID)
adminRouter.get('/user/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/user/:id (Update a user's details)
adminRouter.put('/user/:id', [authMiddleware, adminMiddleware, upload.single('photo')], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { name, email, state, city, dob } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (state) user.state = state;
        if (city) user.city = city;
        if (dob) user.dob = dob;

        if (req.file) {
            user.photoUrl = `/uploads/${req.file.filename}`;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/unvalidated-users
adminRouter.get('/unvalidated-users', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const users = await User.find({ validated: false }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/validate-user/:id
adminRouter.put('/validate-user/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.validated = true;
        await user.save();
        res.json({ msg: 'User validated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/admin/users/:id (Delete a user)
adminRouter.delete('/users/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (user.id === req.user.id) {
            return res.status(400).json({ msg: 'Admin cannot delete their own account.' });
        }
        
        await Vote.deleteMany({ voter: req.params.id });
        await user.deleteOne();

        res.json({ msg: 'User and associated votes deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// NEW ROUTE: Reset a user's password
adminRouter.put('/users/:id/reset-password', [authMiddleware, adminMiddleware], async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();

        res.json({ msg: `Password for ${user.name} has been reset successfully.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Elections CRUD ---
// ... (no changes to election CRUD routes)
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

adminRouter.put('/elections/:id/declare-results', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ msg: 'Election not found' });
        }
        election.resultsDeclared = true;
        await election.save();
        res.json(election);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

adminRouter.put('/elections/:id/revoke-results', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ msg: 'Election not found' });
        }
        election.resultsDeclared = false;
        await election.save();
        res.json(election);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

adminRouter.delete('/elections/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ msg: 'Election not found' });
        }
        
        await Candidate.deleteMany({ election: req.params.id });
        await Vote.deleteMany({ election: req.params.id });
        await election.deleteOne();

        res.json({ msg: 'Election and all related data removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Candidates CRUD ---
// ... (no changes to candidate CRUD routes)
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

adminRouter.delete('/candidates/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ msg: 'Candidate not found' });
        }
        
        await Election.updateOne({ _id: candidate.election }, { $pull: { candidates: candidate._id } });
        await candidate.deleteOne();

        res.json({ msg: 'Candidate removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Party Management ---
// ... (no changes to party management routes)
adminRouter.post('/parties', [authMiddleware, adminMiddleware, upload.single('logo')], async (req, res) => {
    const { name, level } = req.body;
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const newParty = new Party({ name, level, logoUrl });
        const party = await newParty.save();
        res.status(201).json(party);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'A party with this name already exists.' });
        }
        res.status(500).send('Server Error');
    }
});

adminRouter.get('/parties', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const parties = await Party.find();
        res.json(parties);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

adminRouter.put('/parties/:id', [authMiddleware, adminMiddleware, upload.single('logo')], async (req, res) => {
    const { name, level } = req.body;
    try {
        let party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ msg: 'Party not found' });

        const updateData = { name, level };
        if (req.file) {
            updateData.logoUrl = `/uploads/${req.file.filename}`;
            if (party.logoUrl) {
                fs.unlink(path.join(__dirname, '..', party.logoUrl), err => {
                    if (err) console.error("Error deleting old logo:", err);
                });
            }
        }

        party = await Party.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        res.json(party);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

adminRouter.delete('/parties/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ msg: 'Party not found' });

        if (party.logoUrl) {
            fs.unlink(path.join(__dirname, '..', party.logoUrl), err => {
                if (err) console.error("Error deleting logo:", err);
            });
        }

        await party.deleteOne();
        res.json({ msg: 'Party removed successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// --- Results ---
// ... (no changes to results route)
adminRouter.get('/election-results/:electionId', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const electionId = req.params.electionId;
        
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ msg: 'Election not found' });
        
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
                party: '$partyDetails.name', 
                votes: '$count' } }
        ]);
        
        const voterDetails = await Vote.find({ election: electionId })
            .populate('voter', 'name email')
            .populate({
                path: 'candidate',
                populate: { path: 'party', model: 'Party' }
            })
            .sort({ createdAt: -1 });
        
        const voters = voterDetails.map(vote => ({
            voterName: vote.voter.name,
            voterEmail: vote.voter.email,
            candidateName: vote.candidate.name,
            candidateParty: vote.candidate.party.name,
            votedAt: vote.createdAt
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

// PUT /api/admin/validate-user/:id
adminRouter.put('/validate-user/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.validated = true;
        user.validationStatus = 'approved';
        await user.save();
        res.json({ msg: 'User validated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// New Route to Reject a User
adminRouter.put('/reject-user/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    const { reason } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.validated = false;
        user.validationStatus = 'rejected';
        user.rejectionReason = reason;
        await user.save();
        res.json({ msg: 'User validation rejected' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = adminRouter;