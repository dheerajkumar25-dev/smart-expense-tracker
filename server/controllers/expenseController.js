const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
});

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
const setExpense = asyncHandler(async (req, res) => {
    if (!req.body.description || !req.body.amount || !req.body.category) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const expense = await Expense.create({
        user: req.user.id,
        description: req.body.description,
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date || Date.now()
    });

    res.status(200).json(expense);
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(400);
        throw new Error('Expense not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedExpense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(400);
        throw new Error('Expense not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await expense.remove();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getExpenses,
    setExpense,
    updateExpense,
    deleteExpense,
};
