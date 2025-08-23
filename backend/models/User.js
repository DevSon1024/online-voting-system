// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    dob: { type: Date, required: true },
    photoUrl: { type: String },
    validated: { type: Boolean, default: false },
    validationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };