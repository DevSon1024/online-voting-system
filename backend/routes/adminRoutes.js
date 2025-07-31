/*
* backend/routes/adminRoutes.js
* Routes for admin-only actions.
*/
const express = require('express');
const { Election } = require('../models/Election');
const { Candidate } = require('../models/Candidate');
const { Vote } = require('../models/Vote');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const adminRouter = express.Router();

// --- Elections CRUD ---

// POST /api/admin/elections (Create) - No changes needed here
adminRouter.post('/elections', [authMiddleware, adminMiddleware], async (req, res) => {
    const { title, description, startDate, endDate } = req.body;
    try {
        const newElection = new Election({ title, description, startDate, endDate });
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
    const { name, party, electionId } = req.body;
    try {
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ msg: 'Election not found' });

        const newCandidate = new Candidate({ name, party, election: electionId });
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

module.exports = adminRouter;