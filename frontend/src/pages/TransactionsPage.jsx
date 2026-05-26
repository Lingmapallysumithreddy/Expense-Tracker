import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  Download, 
  X,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar
} from 'lucide-react';

const CATEGORIES = {
  income: ['Salary', 'Investment', 'Others'],
  expense: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Others', 'Savings']
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedTxId, setSelectedTxId] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    recurring: 'none'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Construct query parameters
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;

      const { data } = await api.get('/transactions', { params });
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, categoryFilter, startDate, endDate, minAmount, maxAmount]);

  const handleOpenAddModal = () => {
    setModalType('add');
    setForm({
      title: '',
      amount: '',
      type: 'expense',
      category: 'Food',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      recurring: 'none'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setModalType('edit');
    setSelectedTxId(tx._id);
    setForm({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: tx.notes || '',
      recurring: tx.recurring || 'none'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Automatically adjust category if type is changed to avoid invalid categories
    if (name === 'type') {
      const defaultCat = value === 'income' ? 'Salary' : 'Food';
      setForm(prev => ({ ...prev, type: value, category: defaultCat }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category || !form.date) {
      setFormError('Please fill in all required fields');
      return;
    }
    setFormError('');
    setSubmitting(true);

    try {
      if (modalType === 'add') {
        await api.post('/transactions', form);
      } else {
        await api.put(`/transactions/${selectedTxId}`, form);
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // CSV Export Helper
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    
    // Define headers
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Notes', 'Recurring'];
    const rows = transactions.map(t => [
      t.title,
      t.amount,
      t.type,
      t.category,
      new Date(t.date).toLocaleDateString(),
      t.notes || '',
      t.recurring || 'none'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Transactions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your ledger, search records and export data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 transition-all disabled:opacity-50"
          >
            <Download className="h-4.5 w-4.5" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-500 transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Record
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass rounded-3xl p-5 dark:border-slate-800/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Filters */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCategoryFilter(''); // reset category on type shift
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all ${
                showFilters 
                  ? 'border-brand-500 bg-brand-50/20 text-brand-600 dark:border-brand-500 dark:text-brand-400' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850'
              }`}
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 dark:border-slate-850 sm:grid-cols-2 md:grid-cols-4">
            {/* Category dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="">All Categories</option>
                {/* Dynamically list options based on type selection */}
                {(!typeFilter || typeFilter === 'income') && 
                  CATEGORIES.income.map(c => <option key={c} value={c}>{c}</option>)
                }
                {(!typeFilter || typeFilter === 'expense') && 
                  CATEGORIES.expense.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Amount Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-3xl py-16 text-center dark:border-slate-800/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500 mb-4">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No records found</h3>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search tags.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-450 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4">Title</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Amount</th>
                  <th scope="col" className="px-6 py-4">Recurring</th>
                  <th scope="col" className="px-6 py-4">Notes</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          tx.type === 'income' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tx.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{tx.category}</td>
                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={`px-6 py-4 font-bold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 capitalize">{tx.recurring || 'none'}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{tx.notes || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:text-red-405 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          {/* Modal Card */}
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-10 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-850 mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                {modalType === 'add' ? 'Add New Record' : 'Edit Record'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 mb-4 border border-red-200/40">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleFormChange({ target: { name: 'type', value: 'expense' } })}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    form.type === 'expense'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleFormChange({ target: { name: 'type', value: 'income' } })}
                  className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                    form.type === 'income'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Title & Amount */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Weekly Groceries"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Amount ($) *</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    value={form.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {CATEGORIES[form.type].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={form.date}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Recurring schedule */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Recurring schedule</label>
                <select
                  name="recurring"
                  value={form.recurring}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-850 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="none">One-time transaction</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes (optional)</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Details, receipts or subscription intervals..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-850 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalType === 'add' ? 'Save Transaction' : 'Update Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
