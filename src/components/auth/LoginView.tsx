import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Session, UserRole, User } from '../../types';
import {
  Store,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  LogIn,
  Shield,
  Database,
  Sparkles,
  KeyRound,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (session: Session) => void;
}

const REGISTRATION_ROLES: { role: UserRole; label: string; desc: string; icon: string }[] = [
  { role: 'ROLE_ADMIN', label: 'System Admin', desc: 'Full enterprise administrative access across all modules', icon: '⚡' },
  { role: 'ROLE_OWNER', label: 'Enterprise Owner', desc: 'Enterprise executive owner with global governance', icon: '👑' },
  { role: 'ROLE_BRANCH_MGR', label: 'Branch Manager', desc: 'Branch operations, localized pricing & inventory', icon: '🏢' },
  { role: 'ROLE_WH_KEEPER', label: 'Warehouse Keeper', desc: 'Physical stock counts, receipts & warehouse operations', icon: '📦' },
  { role: 'ROLE_PURCHASER', label: 'Purchasing Specialist', desc: 'Supplier procurement, receiving & catalog cost oversight', icon: '📋' },
  { role: 'ROLE_AUDITOR', label: 'Inventory Auditor', desc: 'Read-only stock inspection & financial verification', icon: '🔍' },
  { role: 'ROLE_CASHIER', label: 'POS Cashier', desc: 'Point-of-sale terminal operator (cost prices restricted)', icon: '💳' },
  { role: 'ROLE_CUSTOMER', label: 'Commercial Customer', desc: 'Wholesale & retail buyer account (catalog browsing)', icon: '🛒' },
  { role: 'ROLE_CRAFTSMAN', label: 'Craftsman (حرفي)', desc: 'Contractor, technician & tradesman tier', icon: '🔧' },
];

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [activeMode, setActiveMode] = useState<'signin' | 'register'>('signin');

  // Sign In States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration States
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+201');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('ROLE_ADMIN');
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Load existing accounts from LocalStorage
  useEffect(() => {
    const loaded = db.getUsers();
    setExistingUsers(loaded);
    if (loaded.length === 0) {
      setActiveMode('register');
      setRegRole('ROLE_ADMIN');
    } else {
      setActiveMode('signin');
      setLoginIdentifier(loaded[0].username);
    }
  }, []);

  // Quick template filler for rapid testing without typing
  const handleFillAdminTemplate = () => {
    setRegFullName('System Administrator');
    setRegUsername('admin');
    setRegEmail('admin@alwakala.com');
    setRegPhone('+201000000001');
    setRegPassword('password123');
    setRegConfirmPassword('password123');
    setRegRole('ROLE_ADMIN');
    setRegError(null);
  };

  // Quick select an existing registered account to test that IAM role
  const handleSelectExistingUser = (user: User) => {
    setLoginIdentifier(user.username);
    // If the password matches standard test password or was set, prefill for rapid IAM switching
    if (user.password) {
      setLoginPassword(user.password);
    } else {
      setLoginPassword('');
    }
    setLoginError(null);
  };

  // Handle Login (FR-AUTH-01)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanIdentifier = loginIdentifier.trim();
    if (!cleanIdentifier) {
      setLoginError('Please enter your username or email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Validate directly against LocalStorage engine (alwakala_users)
    const user = db.findUserByUsernameOrEmail(cleanIdentifier);

    if (!user) {
      setIsLoading(false);
      setLoginError('Account not found in browser LocalStorage. Please check your credentials or register a new account.');
      return;
    }

    if (user.password !== loginPassword) {
      setIsLoading(false);
      setLoginError('Incorrect password. Please verify and try again.');
      return;
    }

    if (!user.isActive) {
      setIsLoading(false);
      setLoginError('This account is deactivated. Contact an administrator to reactivate it.');
      return;
    }

    // Success -> set alwakala_session in LocalStorage
    const session = db.setSession(user);
    setIsLoading(false);
    onLoginSuccess(session);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();

    if (!cleanUsername) {
      setRegError('Please provide a unique username.');
      return;
    }
    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      setRegError('Username can only contain lowercase letters, numbers, underscores, and dashes.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setRegError('Please enter a valid email address.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      setRegError('Please enter a valid phone number (e.g. +201012345678).');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!regTermsAccepted) {
      setRegError('Please accept the platform policy terms to register.');
      return;
    }

    setIsLoading(true);

    // Save directly to browser LocalStorage (alwakala_users) with uniqueness checks
    const result = db.createUser({
      username: cleanUsername,
      fullName: regFullName.trim() || undefined,
      email: cleanEmail,
      phone: cleanPhone,
      password: regPassword,
      role: regRole,
      isActive: true,
    });

    setIsLoading(false);

    if (!result.success || !result.user) {
      setRegError(result.error || 'Registration failed. Please try again.');
      return;
    }

    // Successfully registered in LocalStorage!
    setRegSuccessMessage(`Account @${cleanUsername} (${regRole}) created successfully in LocalStorage! Logging you in...`);

    // Refresh existing users
    setExistingUsers(db.getUsers());

    // Auto-login into alwakala_session
    setTimeout(() => {
      const session = db.setSession(result.user!);
      onLoginSuccess(session);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Store className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-slate-900">
          Al-Wakala Platform
        </h2>
        <p className="text-center text-sm text-slate-500 font-ar" dir="rtl">
          منصة الوكالة المركزية لإدارة الفروع والمستودعات والمخزون
        </p>

        {/* LocalStorage Engine Indicator */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-0.5 mx-auto w-fit font-medium">
          <Database className="w-3 h-3 text-emerald-600" />
          <span>Browser LocalStorage Engine Active (Zero Demo Data)</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
          {/* Mode Tabs (Sign In vs Register) */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveMode('signin');
                setLoginError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeMode === 'signin'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In (تسجيل الدخول)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('register');
                setRegError(null);
                setRegSuccessMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                activeMode === 'register'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register (حساب جديد)</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Zero demo data notice when no users exist */}
            {existingUsers.length === 0 && (
              <div className="mb-5 rounded-xl bg-indigo-50/90 border border-indigo-200/80 p-3.5 text-xs text-indigo-900 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-indigo-950 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Clean State: No Demo Data</span>
                </div>
                <p className="text-[11px] text-indigo-800">
                  LocalStorage has zero mock users. Create your first <strong>System Administrator</strong> or manager account below to get started.
                </p>
                {activeMode === 'register' && (
                  <button
                    type="button"
                    onClick={handleFillAdminTemplate}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-2xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Prefill Admin Details</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick IAM Role Switcher / Account Selector when accounts exist */}
            {activeMode === 'signin' && existingUsers.length > 0 && (
              <div className="mb-4 pb-3 border-b border-slate-100">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Registered Account to Test IAM Role:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {existingUsers.map((u) => {
                    const isSelected = loginIdentifier.toLowerCase() === u.username.toLowerCase();
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectExistingUser(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all border ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span>@{u.username}</span>
                        <span className="text-[10px] px-1 py-0.2 rounded-sm bg-white border border-slate-200 text-slate-600 font-mono">
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================== SIGN IN FORM ===================== */}
            {activeMode === 'signin' && (
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                {loginError && (
                  <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-700 leading-relaxed">{loginError}</div>
                  </div>
                )}

                {/* Username or Email */}
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Username or Email
                  </label>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="login-identifier"
                      type="text"
                      autoComplete="username"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. admin or username"
                      className={`block w-full rounded-lg border pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors ${
                        loginError
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative rounded-md shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`block w-full rounded-lg border pl-10 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-colors ${
                        loginError
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Sign In to Platform'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Switcher link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Need a new account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveMode('register')}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ===================== REGISTRATION FORM ===================== */}
            {activeMode === 'register' && (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                {regError && (
                  <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-700 leading-relaxed">{regError}</div>
                  </div>
                )}

                {regSuccessMessage && (
                  <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-700 font-medium leading-relaxed">
                      {regSuccessMessage}
                    </div>
                  </div>
                )}

                {/* Full Name & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Ahmed Hassan"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. admin or manager"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 lowercase"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@domain.com"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+201012345678"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select IAM Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white shadow-2xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {REGISTRATION_ROLES.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.icon} {r.role} — {r.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {REGISTRATION_ROLES.find((r) => r.role === regRole)?.desc}
                  </p>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px]"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showRegPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                  </button>

                  {regPassword && regConfirmPassword && (
                    <span
                      className={`text-[11px] font-semibold ${
                        regPassword === regConfirmPassword ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {regPassword === regConfirmPassword ? '✓ Passwords match' : '✗ Passwords mismatch'}
                    </span>
                  )}
                </div>

                {/* Terms agreement */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={regTermsAccepted}
                      onChange={(e) => setRegTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      I agree to the Al-Wakala enterprise operational terms and security policy.
                    </span>
                  </label>
                </div>

                {/* Submit Register */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isLoading ? 'Creating Account...' : 'Complete Registration & Sign In'}</span>
                  </button>
                </div>

                {/* Switcher back to sign in */}
                {existingUsers.length > 0 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveMode('signin')}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        Sign In here
                      </button>
                    </p>
                  </div>
                )}
              </form>
            )}

            {/* Storage Info Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Zero Demo Data Active</span>
              </span>
              <span className="text-slate-500 font-mono text-[10px]">
                {existingUsers.length} account{existingUsers.length === 1 ? '' : 's'} registered
              </span>
            </div>
          </div>
        </div>

        {/* LocalStorage Data Schema Info Footer */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Stored in browser keys: <code className="font-mono text-[10px] text-slate-500">alwakala_users</code> · <code className="font-mono text-[10px] text-slate-500">alwakala_session</code>
          </p>
        </div>
      </div>
    </div>
  );
};
