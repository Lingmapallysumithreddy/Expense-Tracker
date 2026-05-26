import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Printer, 
  Download, 
  Calendar, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  FileText 
} from 'lucide-react';

const ReportsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Fetch stats for summary timelines
      const statsRes = await api.get('/transactions/stats');
      setStats(statsRes.data);

      // Fetch transactions filtered for the selected month
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      // Set to last day of that month
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      const transRes = await api.get('/transactions', {
        params: { startDate, endDate }
      });
      setTransactions(transRes.data);
    } catch (err) {
      console.error('Error fetching report data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  // CSV Export Helper
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Notes'];
    const rows = transactions.map(t => [
      t.title,
      t.amount,
      t.type,
      t.category,
      new Date(t.date).toLocaleDateString(),
      t.notes || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${selectedMonth}.csv`);
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

  // Find metrics for active month from aggregated stats timeline
  const activeTimelineItem = stats?.monthlyTimeline?.find(item => item.month === selectedMonth);
  const incomeVal = activeTimelineItem ? activeTimelineItem.income : 0;
  const expenseVal = activeTimelineItem ? activeTimelineItem.expenses : 0;
  const netSavings = incomeVal - expenseVal;

  return (
    <div className="space-y-6 print-full">
      {/* Dynamic print-only style block */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, header, nav, .no-print, button, select {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}} />

      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Financial Reports
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate and print ledger statements for your accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute inset-y-0 left-3 flex h-full items-center text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350"
            />
          </div>
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 disabled:opacity-50"
          >
            <Download className="h-4.5 w-4.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            disabled={transactions.length === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            <Printer className="h-4.5 w-4.5" />
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center no-print">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Print Only Header branding */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-5 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">FinFlow Ledger Report</h1>
            <p className="text-sm text-slate-500 mt-1">
              Statement Period: {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Cashflow Metrics cards */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="glass rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/40">
              <p className="text-xs font-semibold text-slate-400">Total Month Income</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1.5 flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                {formatCurrency(incomeVal)}
              </h3>
            </div>
            <div className="glass rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/40">
              <p className="text-xs font-semibold text-slate-400">Total Month Expenses</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1.5 flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="h-4 w-4" />
                </span>
                {formatCurrency(expenseVal)}
              </h3>
            </div>
            <div className="glass rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/40">
              <p className="text-xs font-semibold text-slate-400">Net Period Savings</p>
              <h3 className={`text-2xl font-bold mt-1.5 ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(netSavings)}
              </h3>
            </div>
          </div>

          {/* Ledger Table */}
          {transactions.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center rounded-3xl py-16 text-center dark:border-slate-800/40">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No records to display</h3>
              <p className="mt-1 text-xs text-slate-400">No transactions occurred during this period.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-450 dark:bg-slate-850 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">Title</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                    <th scope="col" className="px-6 py-4">Type</th>
                    <th scope="col" className="px-6 py-4">Amount</th>
                    <th scope="col" className="px-6 py-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 print:hover:bg-transparent">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {tx.title}
                      </td>
                      <td className="px-6 py-4">{tx.category}</td>
                      <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 capitalize">{tx.type}</td>
                      <td className={`px-6 py-4 font-bold ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{tx.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
