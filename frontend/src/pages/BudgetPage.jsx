import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Sparkles,
  PiggyBank,
  CheckCircle,
  Loader2
} from 'lucide-react';

const BUDGET_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Others', 'Savings'];

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  // Stats summary for savings tracker
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    savingsGoal: 1000 // default mock goal
  });
  const [savingsGoalInput, setSavingsGoalInput] = useState('1000');

  // Form State
  const [form, setForm] = useState({
    category: 'Food',
    limitAmount: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgetAndStats = async () => {
    try {
      setLoading(true);
      // Fetch budget comparison for the active month
      const { data } = await api.get(`/budgets/compare`, { params: { month } });
      setBudgets(data);

      // Fetch transaction stats for cashflow summary
      const statsRes = await api.get('/transactions/stats');
      const stats = statsRes.data;

      // Extract details for the current selected month
      // We look at stats.monthlyTimeline to find matching month or fall back to overall summary
      const currentTimeline = stats.monthlyTimeline?.find(item => item.month === month);
      
      const storedGoal = localStorage.getItem(`savings_goal_${month}`) || '1000';
      setSavingsGoalInput(storedGoal);

      setSummary({
        income: currentTimeline ? currentTimeline.income : (stats.summary?.currentMonthStr === month ? stats.summary.currentMonthIncome : 0),
        expenses: currentTimeline ? currentTimeline.expenses : (stats.summary?.currentMonthStr === month ? stats.summary.currentMonthExpenses : 0),
        savingsGoal: Number(storedGoal)
      });
    } catch (err) {
      console.error('Error fetching budget comparison:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetAndStats();
  }, [month]);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.limitAmount) {
      setFormError('Please enter a budget limit amount');
      return;
    }
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/budgets', {
        category: form.category,
        limitAmount: Number(form.limitAmount),
        month
      });
      setForm(prev => ({ ...prev, limitAmount: '' }));
      fetchBudgetAndStats();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgetAndStats();
    } catch (err) {
      alert('Failed to remove: ' + err.message);
    }
  };

  const handleUpdateGoal = (e) => {
    e.preventDefault();
    localStorage.setItem(`savings_goal_${month}`, savingsGoalInput);
    setSummary(prev => ({ ...prev, savingsGoal: Number(savingsGoalInput) }));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  // Calculations for savings tracker
  const actualSavings = Math.max(summary.income - summary.expenses, 0);
  const savingsProgress = summary.savingsGoal > 0 
    ? Math.min(Math.round((actualSavings / summary.savingsGoal) * 100), 1000) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Budgets
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set and track limits for your categories
          </p>
        </div>
        
        {/* Month selector */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="block rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-semibold text-slate-750 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add budget card form */}
        <div className="glass rounded-3xl p-6 dark:border-slate-800/40 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Configure Limit
            </h3>
          </div>

          {formError && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 border border-red-200/40 mb-4 dark:bg-red-950/20 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
              >
                {BUDGET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Monthly Limit Amount ($)</label>
              <input
                type="number"
                name="limitAmount"
                required
                placeholder="e.g. 500"
                value={form.limitAmount}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-500 shadow-md transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
              Set Budget
            </button>
          </form>
        </div>

        {/* Budgets Progress Listings */}
        <div className="glass rounded-3xl p-6 dark:border-slate-800/40 lg:col-span-2 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
            Category Limits Comparison
          </h3>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-brand-600 dark:text-brand-400" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-slate-400">
              <PiggyBank className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
              <p>No budgets configured for this month.</p>
              <p className="mt-1">Add budget limits to prevent overspending alerts.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {budgets.map((bg) => {
                const percent = bg.progressPercent;
                const isClose = percent >= 80;
                return (
                  <div key={bg._id} className="space-y-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-850">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {bg.category}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          ({bg.month})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {formatCurrency(bg.actualSpent)} of {formatCurrency(bg.limitAmount)}
                        </span>
                        <button
                          onClick={() => handleDeleteBudget(bg._id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          bg.isExceeded 
                            ? 'bg-rose-500 shadow-sm shadow-rose-500/20' 
                            : isClose 
                              ? 'bg-amber-500 shadow-sm shadow-amber-500/20' 
                              : 'bg-brand-500 shadow-sm shadow-brand-500/20'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>

                    {/* Exceeded alert banner */}
                    {bg.isExceeded && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/30">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Budget limit exceeded by {formatCurrency(bg.actualSpent - bg.limitAmount)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Savings Target Goals tracker */}
        <div className="glass rounded-3xl p-6 dark:border-slate-800/40 lg:col-span-3 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-450" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Monthly Savings Goal
              </h3>
            </div>
            
            {/* Update goal input */}
            <form onSubmit={handleUpdateGoal} className="flex items-center gap-2">
              <input
                type="number"
                value={savingsGoalInput}
                onChange={(e) => setSavingsGoalInput(e.target.value)}
                placeholder="Savings Target ($)"
                className="w-28 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Set Goal
              </button>
            </form>
          </div>

          <div className="grid gap-6 md:grid-cols-3 items-center">
            {/* Numbers metrics */}
            <div className="space-y-4 md:col-span-1">
              <div>
                <p className="text-xs font-semibold text-slate-400">Monthly Net Income</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(summary.income)}
                </h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Monthly Expenses</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(summary.expenses)}
                </h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Actual Monthly Savings</p>
                <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-450">
                  {formatCurrency(actualSavings)}
                </h4>
              </div>
            </div>

            {/* Progress Circular/Slider visual */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-500">Savings Progression</span>
                <span className="text-slate-800 dark:text-slate-200">{savingsProgress}%</span>
              </div>
              
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className="h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20 transition-all duration-300"
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                />
              </div>

              {savingsProgress >= 100 ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-450">
                  <CheckCircle className="h-4 w-4" />
                  Congratulations! You've achieved your savings target for {month}.
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Save {formatCurrency(Math.max(summary.savingsGoal - actualSavings, 0))} more to achieve your target.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
