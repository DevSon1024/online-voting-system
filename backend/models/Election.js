// backend/models/Election.js
const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }]
});

const Election = mongoose.model('Election', electionSchema);

module.exports = { Election };