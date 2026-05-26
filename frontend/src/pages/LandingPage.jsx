import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  ShieldCheck, 
  Smartphone, 
  PieChart, 
  Sparkles,
  ArrowRight,
  PiggyBank
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: 'Smart Analytics',
      desc: 'Interactive breakdowns of your income and expenses with premium responsive graphs.',
      icon: PieChart,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Category Budgets',
      desc: 'Set limits for food, bills, shopping, and entertainment to avoid exceeding your goals.',
      icon: PiggyBank,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Secure Accounts',
      desc: 'JWT-based session authentication with securely hashed encryption standards.',
      icon: ShieldCheck,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Fully Responsive',
      desc: 'Clean layouts tailored for desktop, tablet, and mobile browsers with custom light/dark toggles.',
      icon: Smartphone,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Navbar */}
      <nav className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            FinFlow
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-slate-600 hover:text-slate-905 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 hover:bg-brand-500 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-6 py-20 text-center md:py-32">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[310px] w-[310px] rounded-full bg-brand-500/10 blur-[100px] dark:bg-brand-500/5" />
          <div className="h-[250px] w-[250px] rounded-full bg-emerald-500/10 blur-[80px] dark:bg-emerald-500/5 ml-48" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/20 dark:text-brand-400 mb-6 border border-brand-100 dark:border-brand-900/30">
          <TrendingUp className="h-3.5 w-3.5" />
          Intelligent Money Management
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-slate-50">
          Take command of your <br />
          <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-emerald-400">
            financial future
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-650 dark:text-slate-400 leading-relaxed">
          FinFlow makes tracking transactions, managing category budgets, and visualising analytics simple. Achieve your savings goals with our modern workspace.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 transition-all hover:scale-[1.01]"
          >
            Get Started Free
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 transition-all"
          >
            Live Demo
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-14 md:text-3xl">
          Everything you need to track smarter
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.title} 
                className="glass rounded-2xl p-6 transition-all duration-200 hover:shadow-md dark:border-slate-800/40"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feat.color} mb-5`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-8 text-center text-xs text-slate-400 dark:border-slate-800/40">
        <p>© 2026 FinFlow Inc. All rights reserved. Built for modern financial clarity.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
