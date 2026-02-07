const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

/* UPDATE user currency */
router.put('/currency', protect, async (req, res) => {
    const { currency } = req.body;

    if (!['INR', 'USD', 'EUR'].includes(currency)) {
        return res.status(400).json({ message: 'Invalid currency' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.currency = currency;
    await user.save();

    res.json({
        message: 'Currency updated',
        currency: user.currency,
    });
});

module.exports = router;
