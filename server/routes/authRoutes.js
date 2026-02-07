const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    updateCurrency, // ✅ NEW
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware'); // ✅ NEW

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Phase 2: Update user currency (protected)
router.put('/currency', protect, updateCurrency);

module.exports = router;
