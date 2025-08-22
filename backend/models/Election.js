// backend/models/Election.js
const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    electionLevel: { type: String, required: true },
    electionType: { type: String, required: true },
    state: { type: String }, // New field for location
    city: { type: String },  // New field for location
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
    resultsDeclared: { type: Boolean, default: false } // New field
});

const Election = mongoose.model('Election', electionSchema);

module.exports = { Election };