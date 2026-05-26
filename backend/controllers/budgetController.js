const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Set or update budget for a category & month
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { category, limitAmount, month } = req.body;

    if (!category || !limitAmount || !month) {
      res.status(400);
      throw new Error('Please fill in all required fields (category, limitAmount, month)');
    }

    // Upsert: Find budget for this user, category, and month. If found, update it. If not, create it.
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month },
      { limitAmount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user budgets for a specific month
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
    const budgets = await Budget.find({ userId: req.user._id, month });
    res.json(budgets);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await budget.deleteOne();
    res.json({ message: 'Budget removed', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget vs actual spending breakdown with alerts
// @route   GET /api/budgets/compare
// @access  Private
const getBudgetComparison = async (req, res, next) => {
  try {
    const monthStr = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const userId = req.user._id;

    // Parse monthStr to date range for transactions
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Fetch all budgets set for the user in this month
    const budgets = await Budget.find({ userId, month: monthStr });

    // 2. Aggregate transactions for this month grouped by category (only expenses)
    const actualSpending = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    // Map actual spending array to key-value object
    const spendingMap = {};
    actualSpending.forEach(item => {
      spendingMap[item._id] = item.totalSpent;
    });

    // 3. Merge budgets with actuals
    const comparison = budgets.map(budget => {
      const actualSpent = spendingMap[budget.category] || 0;
      const progressPercent = Math.min(Math.round((actualSpent / budget.limitAmount) * 100), 1000); // Allow over 100%
      return {
        _id: budget._id,
        category: budget.category,
        limitAmount: budget.limitAmount,
        actualSpent,
        progressPercent,
        isExceeded: actualSpent > budget.limitAmount,
        month: budget.month
      };
    });

    // Also check if there are categories with spending but no explicit budget set
    // to give a complete view, if requested. Let's return the comparative list.
    res.json(comparison);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setBudget,
  getBudgets,
  deleteBudget,
  getBudgetComparison
};
