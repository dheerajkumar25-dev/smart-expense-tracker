const express = require('express');
const Expense = require('../models/Expense');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

/* GET user expenses */
router.get('/', protect, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch expenses' });
    }
});

/* ADD expense */
router.post('/', protect, async (req, res) => {
    const { title, amount, category } = req.body;

    try {
        const expense = await Expense.create({
            user: req.user._id,
            title,
            amount,
            category,
        });

        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add expense' });
    }
});

module.exports = router;
