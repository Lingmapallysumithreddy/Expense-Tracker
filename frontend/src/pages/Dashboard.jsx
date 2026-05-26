import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  AlertTriangle,
  Receipt,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

const COLORS = {
  'Food': '#ef4444',
  'Travel': '#3b82f6',
  'Shopping': '#ec4899',
  'Bills': '#f59e0b',
  'Entertainment': '#8b5cf6',
  'Health': '#10b981',
  'Others': '#64748b',
  'Salary': '#22c55e',
  'Investment': '#06b6d4',
  'Savings': '#14b8a6'
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await api.get('/transactions/stats');
      setStats(statsRes.data);

      // Fetch budgets comparison
      const budgetsRes = await api.get('/budgets/compare');
      setBudgets(budgetsRes.data);

      // Fetch recent transactions (limit = 5)
      const transRes = await api.get('/transactions');
      setRecentTransactions(transRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600 dark:border-slate-800 dark:border-t-brand-400" />
      </div>
    );
  }

  const summary = stats?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    remainingBalance: 0,
    currentMonthIncome: 0,
    currentMonthExpenses: 0
  };

  const hasData = recentTransactions.length > 0;

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your performance, budgets, and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/transactions"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 hover:bg-brand-500 transition-all hover:scale-[1.01]"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Income Card */}
        <div className="glass rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Total Income
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {formatCurrency(summary.totalIncome)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="h-3 w-3" />
                Current Month:
              </span>
              {formatCurrency(summary.currentMonthIncome)}
            </p>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="glass rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-650 dark:text-rose-450">
              <TrendingDown className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {formatCurrency(summary.totalExpenses)}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <span className="flex items-center text-rose-600 dark:text-rose-400 font-medium">
                <ArrowDownRight className="h-3 w-3" />
                Current Month:
              </span>
              {formatCurrency(summary.currentMonthExpenses)}
            </p>
          </div>
        </div>

        {/* Remaining Balance Card */}
        <div className="glass rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/40 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Net Balance
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <DollarSign className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-3xl font-bold tracking-tight ${summary.remainingBalance >= 0 ? 'text-slate-900 dark:text-slate-50' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(summary.remainingBalance)}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Across all logged history
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        /* Empty State UI */
        <div className="glass flex flex-col items-center justify-center rounded-3xl py-20 px-6 text-center dark:border-slate-800/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 mb-5">
            <Receipt className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No transactions found
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Get started by logging your first income or expense transaction to populate dashboard stats.
          </p>
          <Link
            to="/transactions"
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-500 transition-all"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Log First Transaction
          </Link>
        </div>
      ) : (
        /* Graphs & Activity Content */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline chart */}
          <div className="glass rounded-3xl p-6 dark:border-slate-800/40 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-6">
              Monthly Cash Flow
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.monthlyTimeline || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} className="hidden dark:block" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar name="Income" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar name="Expenses" dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Pie Chart */}
          <div className="glass rounded-3xl p-6 dark:border-slate-800/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-6">
              Expenses Breakdown
            </h3>
            <div className="h-64 w-full">
              {stats?.categoryBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.categoryBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => formatCurrency(val)}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No expense breakdown available
                </div>
              )}
            </div>
            {/* Pie Legends */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              {stats?.categoryBreakdown?.slice(0, 4).map((entry, index) => (
                <div key={entry.category} className="flex items-center gap-1.5">
                  <span 
                    className="h-2.5 w-2.5 rounded-full" 
                    style={{ backgroundColor: COLORS[entry.category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }} 
                  />
                  <span>{entry.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="glass rounded-3xl p-6 dark:border-slate-800/40 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Recent Transactions
              </h3>
              <Link 
                to="/transactions" 
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                View All
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: COLORS[tx.category] || '#64748b' }} 
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {tx.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {tx.category} • {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-800 dark:text-slate-200'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Warnings Card */}
          <div className="glass rounded-3xl p-6 dark:border-slate-800/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mb-5">
              Category Budgets
            </h3>
            <div className="space-y-4">
              {budgets.length > 0 ? (
                budgets.slice(0, 3).map((bg) => {
                  const percent = bg.progressPercent;
                  const isClose = percent >= 80;
                  return (
                    <div key={bg._id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {bg.category}
                        </span>
                        <span className="text-slate-500">
                          {formatCurrency(bg.actualSpent)} / {formatCurrency(bg.limitAmount)}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div 
                          className={`h-2 rounded-full transition-all duration-305 ${
                            bg.isExceeded 
                              ? 'bg-rose-500' 
                              : isClose 
                                ? 'bg-amber-500' 
                                : 'bg-brand-500'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>

                      {/* Exceeded Warning */}
                      {bg.isExceeded && (
                        <p className="flex items-center gap-1 text-[10px] font-semibold text-rose-650 dark:text-rose-450">
                          <AlertTriangle className="h-3 w-3" />
                          Budget exceeded by {formatCurrency(bg.actualSpent - bg.limitAmount)}!
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400">
                  <p>No monthly budgets configured.</p>
                  <Link 
                    to="/budgets" 
                    className="mt-2 font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Setup Budgets
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
