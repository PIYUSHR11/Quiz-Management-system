const mongoose = require('mongoose');

// 3. Result Schema (Stores the outcome of a quiz attempt)
const ResultSchema = new mongoose.Schema({
    // Link to the specific Quiz document that was taken
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    
    // Identity of the person who took the quiz
    takerName: { type: String, required: true, trim: true },
    takerEmail: { type: String, trim: true },
    
    // Scoring details
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    
    // Store the raw answers submitted by the user
    answers: [mongoose.Schema.Types.Mixed], 
    
    // Timestamp of submission
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);