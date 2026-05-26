import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Key, 
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email) {
      setError('Name and email are required');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { name, email };
      if (password) {
        updateData.password = password;
      }

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          User Profile
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details and account settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card Summary */}
        <div className="glass flex flex-col items-center text-center rounded-3xl p-6 dark:border-slate-800/40 h-fit">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-600 text-3xl font-extrabold text-white shadow-lg shadow-brand-500/20 mb-4">
            {user?.name ? getInitials(user.name) : 'U'}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name}</h3>
          <p className="text-sm text-slate-450 dark:text-slate-400">{user?.email}</p>

          <div className="mt-6 flex w-full flex-col border-t border-slate-100 dark:border-slate-850 pt-5 text-left space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Member Since</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile form card */}
        <div className="glass rounded-3xl p-6 dark:border-slate-800/40 md:col-span-2">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 dark:border-slate-850">
            <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Update Profile Details
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Messages alerts */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/35">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-200/35">
                <Sparkles className="h-4 w-4" />
                {success}
              </div>
            )}

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute inset-y-0 left-3.5 flex h-full items-center text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute inset-y-0 left-3.5 flex h-full items-center text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 dark:border-slate-850 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                Change Password (leave blank to keep current)
              </h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">New Password</label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute inset-y-0 left-3.5 flex h-full items-center text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute inset-y-0 left-3.5 flex h-full items-center text-slate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-850 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 shadow-md transition-all disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Internal mini-component for lock icon to keep imports clean
const LockIcon = (props) => <Key className="h-5 w-5" {...props} />;

export default ProfilePage;
