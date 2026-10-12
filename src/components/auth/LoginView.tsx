import React, { useState } from 'react';
import { db } from '../../services/db';
import { Session, User } from '../../types';
import { Store, Lock, User as UserIcon, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (session: Session) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Validate against alwakala_users
    const user = db.findUserByUsernameOrEmail(cleanIdentifier);

    if (!user) {
      setIsLoading(false);
      setError('Account not found. Please check your username or email.');
      return;
    }

    if (user.password !== password) {
      setIsLoading(false);
      setError('Invalid credentials. Please verify your password.');
      return;
    }

    if (!user.isActive) {
      setIsLoading(false);
      setError('This account has been deactivated. Please contact your system administrator.');
      return;
    }

    // Success -> set alwakala_session
    const session = db.setSession(user);
    setIsLoading(false);
    onLoginSuccess(session);
  };

  const handleQuickLogin = (presetUsername: string, presetPass: string = 'password123') => {
    setIdentifier(presetUsername);
    setPassword(presetPass);
    setError(null);
    const user = db.findUserByUsernameOrEmail(presetUsername);
    if (user && user.isActive) {
      const session = db.setSession(user);
      onLoginSuccess(session);
    }
  };

  const demoAccounts = [
    { username: 'admin', role: 'ROLE_ADMIN', label: 'Admin (Full Access)' },
    { username: 'cairo_mgr', role: 'ROLE_BRANCH_MGR', label: 'Cairo Branch Mgr' },
    { username: 'cashier1', role: 'ROLE_CASHIER', label: 'Cashier Staff' },
    { username: 'keeper_alex', role: 'ROLE_WH_KEEPER', label: 'Warehouse Keeper' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Store className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Al-Wakala Platform
        </h2>
        <p className="text-center text-sm text-slate-500 font-ar mt-0.5">
          منصة الوكالة لإدارة الفروع والمستودعات والمخزون
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          Sign in to access your branch management portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Banner */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-700 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Username or Email */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Username or Email
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or admin@alwakala.com"
                  className={`block w-full rounded-lg border pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 mt-1">
                  Please provide a valid registered username or email.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full rounded-lg border pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Session...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Instant Demo Access
              </span>
              <span className="text-[10px] text-slate-400 font-mono">pwd: password123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.username}
                  type="button"
                  onClick={() => handleQuickLogin(demo.username)}
                  className="flex items-center justify-between p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors group"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">
                      {demo.username}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{demo.label}</p>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
