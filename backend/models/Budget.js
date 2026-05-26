const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category for the budget'],
    enum: [
      'Food',
      'Travel',
      'Shopping',
      'Bills',
      'Entertainment',
      'Health',
      'Others',
      'Savings'
    ]
  },
  limitAmount: {
    type: Number,
    required: [true, 'Please set a budget limit amount']
  },
  month: {
    type: String,
    required: [true, 'Please specify the month (format: YYYY-MM)'],
    // We store as 'YYYY-MM' (e.g. '2026-05') to easily run monthly queries
    match: [/^\d{4}-\d{2}$/, 'Please use the YYYY-MM format']
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of budget per user + category + month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
