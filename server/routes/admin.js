const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz'); // Import the model
const verifyAdmin = require('../middleware/auth'); // Import the middleware

// POST /api/admin/quizzes - Create a new quiz
router.post('/quizzes', verifyAdmin, async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        // Create a new quiz instance
        const newQuiz = new Quiz({
            title,
            description,
            questions,
            // req.user is populated by the verifyAdmin middleware
            createdBy: req.user.userId 
        });

        // Save to MongoDB
        await newQuiz.save();

        // Send the newly created quiz back to the client
        res.status(201).json(newQuiz);

    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ message: 'Server error while saving quiz.' });
    }
});

module.exports = router;