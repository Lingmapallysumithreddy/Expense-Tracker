const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a transaction title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Food',
      'Travel',
      'Shopping',
      'Bills',
      'Entertainment',
      'Health',
      'Others',
      'Salary',      // Add Salary as a default income category
      'Investment',  // Add Investment as a default income/expense category
      'Savings'      // Add Savings as a default category
    ]
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
