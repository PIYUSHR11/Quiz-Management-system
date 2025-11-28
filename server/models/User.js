const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. User Schema (for Admin and Quiz Takers)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    name: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving using the pre-save hook
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);