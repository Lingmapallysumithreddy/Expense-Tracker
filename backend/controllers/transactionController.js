const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes, recurring } = req.body;

    if (!title || !amount || !type || !category) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      notes: notes || '',
      recurring: recurring || 'none'
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions (with filtering, search and pagination)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };

    // Search query by title (case-insensitive)
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by type (income/expense)
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Set to end of day to include transactions on that date
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Filter by amount range
    if (req.query.minAmount || req.query.maxAmount) {
      query.amount = {};
      if (req.query.minAmount) {
        query.amount.$gte = Number(req.query.minAmount);
      }
      if (req.query.maxAmount) {
        query.amount.$lte = Number(req.query.maxAmount);
      }
    }

    // Execute query with sorting
    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction analytics & stats
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Overall stats (total income, total expense, balance)
    const overallStats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const totalIncome = overallStats[0] ? overallStats[0].totalIncome : 0;
    const totalExpenses = overallStats[0] ? overallStats[0].totalExpenses : 0;
    const remainingBalance = totalIncome - totalExpenses;

    // 2. Category-wise expense breakdown (pie chart data)
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense'
        }
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      },
      { $project: { category: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } }
    ]);

    // 3. Monthly analytics timeline (past 6-12 months for charts)
    const monthlyStats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      { $project: { month: '$_id.month', income: 1, expenses: 1, _id: 0 } },
      { $sort: { month: 1 } }
    ]);

    // 4. Current Month specific aggregates
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentMonthStr = `${currentYear}-${currentMonth}`;

    const currentMonthStats = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: new Date(currentYear, currentDate.getMonth(), 1),
            $lte: new Date(currentYear, currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const currentMonthIncome = currentMonthStats[0] ? currentMonthStats[0].income : 0;
    const currentMonthExpenses = currentMonthStats[0] ? currentMonthStats[0].expenses : 0;

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        remainingBalance,
        currentMonthIncome,
        currentMonthExpenses,
        currentMonthStr
      },
      categoryBreakdown,
      monthlyTimeline: monthlyStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
};
