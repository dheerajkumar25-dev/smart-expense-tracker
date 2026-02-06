const express = require('express');
const Budget = require('../models/Budget');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res) => {
    const budget = await Budget.findOne({ user: req.user._id });
    res.json(budget);
});

router.post('/', protect, async (req, res) => {
    const { amount } = req.body;

    let budget = await Budget.findOne({ user: req.user._id });

    if (budget) {
        budget.amount = amount;
        await budget.save();
    } else {
        budget = await Budget.create({
            user: req.user._id,
            amount,
        });
    }

    res.json(budget);
});

module.exports = router;
