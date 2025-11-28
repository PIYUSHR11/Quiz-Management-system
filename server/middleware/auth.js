//const jwt = require('jsonwebtoken');
//// Replace with your actual secret key from .env
//const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; 
//
//const verifyAdmin = (req, res, next) => {
//    // 1. Get token from header: Authorization: Bearer <token>
//    const authHeader = req.header('Authorization');
//    if (!authHeader) {
//        return res.status(401).json({ message: 'Access denied. No token provided.' });
//    }
//
//    const token = authHeader.replace('Bearer ', '');
//
//    try {
//        // 2. Verify token
//        const decoded = jwt.verify(token, JWT_SECRET);
//        
//        // 3. Attach user info to request
//        req.user = decoded; 
//        
//        // 4. Check for Admin role
//        if (req.user.role !== 'admin') {
//            return res.status(403).json({ message: 'Forbidden. Admin access required.' });
//        }
//        
//        next();
//    } catch (ex) {
//        res.status(400).json({ message: 'Invalid token.' });
//    }
//};
//
//module.exports = verifyAdmin;

const jwt = require('jsonwebtoken');
// Load JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; 

// Middleware to verify JWT token and attach user info (id, role) to req.user
const auth = (req, res, next) => {
    try {
        // Expects Authorization: Bearer <token>
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ error: 'Please authenticate. Token format invalid or missing.' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = decoded; // Contains { id: '...', role: '...' }
        next();
    } catch (error) {
        // This catches token verification failures (expired, invalid signature, etc.)
        res.status(401).send({ error: 'Please authenticate. Invalid or expired token.' });
    }
};

// Middleware to check if the authenticated user is an admin
const adminAuth = (req, res, next) => {
    // Requires 'auth' middleware to run first to populate req.user
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Access denied. Admin role required.' });
    }
    next();
};

module.exports = { auth, adminAuth };