// backend/models/Candidate.js
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Change party from a string to a reference to the Party model
    party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true }
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = { Candidate };