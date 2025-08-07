// backend/models/Party.js
const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    level: { type: String, enum: ['National', 'Local'], required: true },
    logoUrl: { type: String } // Field to store the path to the logo
});

const Party = mongoose.model('Party', partySchema);

module.exports = { Party };