//const express = require('express');
//const mongoose = require('mongoose');
//const jwt = require('jsonwebtoken');
//const bcrypt = require('bcryptjs');
//const cors = require('cors'); // Essential for connecting frontend (React)
//
//const app = express();
//const port = 3000;
//const JWT_SECRET = 'your_super_secret_key'; // Replace in production!
//
//// --- Middleware ---
//app.use(cors());
//app.use(express.json());
//
//// --- MongoDB Connection ---
//const MONGODB_URI = 'mongodb+srv://piyushrajeshinde_db_user:Q9HaIf0cstc0AXi8@cluster0.enltyrh.mongodb.net/?appName=Cluster0';
//mongoose.connect(MONGODB_URI)
//    .then(() => console.log('MongoDB connected successfully.'))
//    .catch(err => console.error('MongoDB connection error:', err));
//
//// --- Mongoose Schemas ---
//
//// 1. User Schema (for Admin and Quiz Takers)
//const UserSchema = new mongoose.Schema({
//    email: { type: String, required: true, unique: true },
//    password: { type: String, required: true },
//    role: { type: String, enum: ['admin', 'user'], default: 'user' },
//    name: String,
//    createdAt: { type: Date, default: Date.now }
//});
//
//// Hash password before saving
//UserSchema.pre('save', async function(next) {
//    if (this.isModified('password')) {
//        this.password = await bcrypt.hash(this.password, 10);
//    }
//    next();
//});
//
//const User = mongoose.model('User', UserSchema);
//
//// 2. Quiz Schema
//const QuizSchema = new mongoose.Schema({
//    title: { type: String, required: true },
//    description: String,
//    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//    questions: [{
//        questionType: { // 'MCQ', 'TrueFalse', 'Text'
//            type: String,
//            required: true,
//            enum: ['MCQ', 'TrueFalse', 'Text']
//        },
//        text: { type: String, required: true },
//        options: [String], // For MCQ
//        correctAnswer: mongoose.Schema.Types.Mixed, // String (for Text/TrueFalse) or Array index (for MCQ)
//        points: { type: Number, default: 1 }
//    }],
//    createdAt: { type: Date, default: Date.now }
//});
//
//const Quiz = mongoose.model('Quiz', QuizSchema);
//
//// 3. Result Schema (Optional but recommended for storing public results)
//const ResultSchema = new mongoose.Schema({
//    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
//    takerName: { type: String, required: true },
//    takerEmail: String,
//    score: { type: Number, required: true },
//    maxScore: { type: Number, required: true },
//    answers: [mongoose.Schema.Types.Mixed], // Store the submitted answers
//    submittedAt: { type: Date, default: Date.now }
//});
//
//const Result = mongoose.model('Result', ResultSchema);
//
//// --- Auth Middleware for Admin Routes ---
//const auth = (req, res, next) => {
//    try {
//        const token = req.header('Authorization').replace('Bearer ', '');
//        const decoded = jwt.verify(token, JWT_SECRET);
//        req.user = decoded; // Contains { id: '...', role: '...' }
//        next();
//    } catch (error) {
//        res.status(401).send({ error: 'Please authenticate.' });
//    }
//};
//
//const adminAuth = (req, res, next) => {
//    if (req.user.role !== 'admin') {
//        return res.status(403).send({ error: 'Access denied. Admin required.' });
//    }
//    next();
//};
//
//// --- API Endpoints ---
//
//// 1. Auth & Login
//app.post('/api/auth/login', async (req, res) => {
//    try {
//        const { email, password } = req.body;
//        const user = await User.findOne({ email });
//        if (!user || !(await bcrypt.compare(password, user.password))) {
//            return res.status(400).send({ error: 'Invalid login credentials.' });
//        }
//        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
//        res.send({ user: { id: user._id, role: user.role, email: user.email }, token });
//    } catch (error) {
//        res.status(500).send({ error: error.message });
//    }
//});
//
//// 2. Admin: Create User (Simulates sending an email with temporary password)
//app.post('/api/admin/users', auth, adminAuth, async (req, res) => {
//    try {
//        const { email, name, role } = req.body;
//        // Generate a random temporary password
//        const tempPassword = Math.random().toString(36).slice(-8);
//        const user = new User({ email, name, role: role || 'user', password: tempPassword });
//        await user.save();
//
//        // TODO: Implement actual email sending functionality here (e.g., using Nodemailer)
//        console.log(`Email simulation: Sent temporary password '${tempPassword}' to ${email}`);
//
//        res.status(201).send({ user: { id: user._id, email: user.email, role: user.role }, message: 'User created. Temporary password sent via simulated email.' });
//    } catch (error) {
//        res.status(400).send({ error: 'User creation failed.' });
//    }
//});
//
//// 3. Admin: Quiz CRUD
//app.post('/api/admin/quizzes', auth, adminAuth, async (req, res) => {
//    try {
//        const quiz = new Quiz({ ...req.body, createdBy: req.user.id });
//        await quiz.save();
//        res.status(201).send(quiz);
//    } catch (error) {
//        res.status(400).send({ error: error.message });
//    }
//});
//
//// 4. Public/Admin: Get all quizzes (just title/ID for public list)
//app.get('/api/quizzes', async (req, res) => {
//    try {
//        const quizzes = await Quiz.find({}, 'title description createdAt');
//        res.send(quizzes);
//    } catch (error) {
//        res.status(500).send({ error: 'Could not fetch quizzes.' });
//    }
//});
//
//// 5. Public: Get a single quiz for taking (excluding correct answers)
//app.get('/api/quizzes/:id', async (req, res) => {
//    try {
//        const quiz = await Quiz.findById(req.params.id, { 'questions.correctAnswer': 0, createdBy: 0 }); // Exclude answers
//        if (!quiz) return res.status(404).send({ error: 'Quiz not found.' });
//        res.send(quiz);
//    } catch (error) {
//        res.status(500).send({ error: 'Error fetching quiz.' });
//    }
//});
//
//// 6. Public: Submit Quiz
//app.post('/api/quizzes/:id/submit', async (req, res) => {
//    try {
//        const { takerName, takerEmail, answers } = req.body;
//        const quiz = await Quiz.findById(req.params.id);
//        if (!quiz) return res.status(404).send({ error: 'Quiz not found.' });
//
//        let score = 0;
//        let maxScore = 0;
//
//        // Scoring Logic
//        quiz.questions.forEach((q, index) => {
//            const submittedAnswer = answers[index];
//            maxScore += q.points;
//
//            // Simple comparison logic (can be expanded for complexity)
//            if (q.questionType === 'MCQ') {
//                // For MCQ, correctAnswer is the index of the correct option
//                if (submittedAnswer === q.correctAnswer) {
//                    score += q.points;
//                }
//            } else if (q.questionType === 'TrueFalse') {
//                // For TrueFalse, correctAnswer is the string 'True' or 'False'
//                if (String(submittedAnswer) === String(q.correctAnswer)) {
//                    score += q.points;
//                }
//            } else if (q.questionType === 'Text') {
//                // For Text, simply check if the submitted text matches (case-insensitive, trimmed)
//                if (String(submittedAnswer).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim()) {
//                    score += q.points;
//                }
//            }
//        });
//
//        // Save result
//        const result = new Result({
//            quizId: quiz._id,
//            takerName,
//            takerEmail,
//            score,
//            maxScore,
//            answers
//        });
//        await result.save();
//
//        res.send({ score, maxScore, message: `Quiz submitted! Your score: ${score}/${maxScore}` });
//
//    } catch (error) {
//        res.status(500).send({ error: error.message });
//    }
//});
//
//// --- Server Start ---
//app.listen(port, () => {
//    console.log(`Server running at http://localhost:${port}`);
//});

const mongoose = require('mongoose');

// Define Question Schema
const QuestionSchema = new mongoose.Schema({
    questionType: { // 'MCQ', 'TrueFalse', 'Text'
        type: String,
        required: true,
        enum: ['MCQ', 'TrueFalse', 'Text']
    },
    text: { type: String, required: true },
    options: [String], // For MCQ
    // Stores the correct answer: index (for MCQ), 'True'/'False' (for TrueFalse), or String (for Text)
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, 
    points: { type: Number, default: 1 }
});

// 2. Quiz Schema
const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    // createdBy stores the ID of the admin user who created it
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
