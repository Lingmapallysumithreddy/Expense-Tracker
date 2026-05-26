const express = require('express');
const router = express.Router();
const {
  setBudget,
  getBudgets,
  deleteBudget,
  getBudgetComparison
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all budget routes

router.route('/compare').get(getBudgetComparison);

router.route('/')
  .post(setBudget)
  .get(getBudgets);

router.route('/:id')
  .delete(deleteBudget);

module.exports = router;
