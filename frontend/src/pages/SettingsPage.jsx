import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  Sun, 
  Moon, 
  Sparkles,
  BellRing,
  Shield,
  Loader2,
  Database
} from 'lucide-react';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock settings toggles
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReports: false,
    recurringNotifications: true
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/transactions/stats');
      const txRes = await api.get('/transactions');
      const bgRes = await api.get('/budgets');

      setStats({
        totalCount: txRes.data.length,
        budgetCount: bgRes.data.length,
        balance: data.summary?.remainingBalance || 0
      });
    } catch (err) {
      console.error('Failed to load settings stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize your preferences, layout themes and notifications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Visual appearance card */}
        <div className="glass rounded-3xl p-6 dark:border-slate-800/40 space-y-5 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-850">
            <Sun className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Visual Appearance
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Layout Theme</p>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Toggle between light and dark modes</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4.5 w-4.5 text-yellow-500" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4.5 w-4.5 text-slate-600" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications settings card */}
        <div className="glass rounded-3xl p-6 dark:border-slate-800/40 space-y-5 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-850">
            <BellRing className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Budget Notifications
            </h3>
          </div>

          <div className="space-y-4">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-850 dark:text-slate-200">Budget Exceeded Alerts</p>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Notify when spending goes above 80% limit</p>
              </div>
              <button
                onClick={() => handleToggleNotification('budgetAlerts')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  notifications.budgetAlerts ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    notifications.budgetAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-850 dark:text-slate-200">Weekly Summaries</p>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Receive summary reports on weekend progress</p>
              </div>
              <button
                onClick={() => handleToggleNotification('weeklyReports')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  notifications.weeklyReports ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    notifications.weeklyReports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-850 dark:text-slate-200">Subscription Reminders</p>
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Alert before recurring invoices are charged</p>
              </div>
              <button
                onClick={() => handleToggleNotification('recurringNotifications')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  notifications.recurringNotifications ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    notifications.recurringNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Database analytics summaries */}
        <div className="glass rounded-3xl p-6 dark:border-slate-800/40 space-y-5 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-850">
            <Database className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              System Diagnostics & Data
            </h3>
          </div>

          {loading ? (
            <div className="flex h-16 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-400" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-850">
                <p className="text-xs font-semibold text-slate-400">Total Ledgers Logged</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {stats?.totalCount} transactions
                </h4>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-850">
                <p className="text-xs font-semibold text-slate-400">Category Budgets</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {stats?.budgetCount} limits active
                </h4>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-850">
                <p className="text-xs font-semibold text-slate-400">Total Net Worth</p>
                <h4 className={`text-lg font-bold mt-1 ${stats?.balance >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-400'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.balance)}
                </h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
