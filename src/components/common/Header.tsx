import React, { useState } from 'react';
import {
  Building2,
  Users,
  Package,
  LogOut,
  RotateCcw,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { Session, Location, UserRole } from '../../types';

interface HeaderProps {
  session: Session;
  locations: Location[];
  activeBranchId: string;
  onBranchChange: (branchId: string) => void;
  activeTab: 'overview' | 'users' | 'locations' | 'products';
  onTabChange: (tab: 'overview' | 'users' | 'locations' | 'products') => void;
  onLogout: () => void;
  onResetDB: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  locations,
  activeBranchId,
  onBranchChange,
  activeTab,
  onTabChange,
  onLogout,
  onResetDB,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const activeBranch = locations.find((l) => l.id === activeBranchId) || locations[0];

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ROLE_ADMIN':
      case 'ROLE_OWNER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ROLE_BRANCH_MGR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ROLE_WH_KEEPER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ROLE_CASHIER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Authentication & Users', icon: Users },
    { id: 'locations', label: 'Branches & Warehouses', icon: Building2 },
    { id: 'products', label: 'Product Catalog', icon: Package },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                  Al-Wakala
                </span>
                <span className="text-xs font-semibold text-slate-400 font-ar">
                  الوكالة
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Enterprise Multi-Branch Platform
              </p>
            </div>
          </div>

          {/* Desktop Right Controls: Branch Selector, User Badge, Reset & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {/* Branch Selector Context */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Context
                </span>
                <div className="relative">
                  <select
                    value={activeBranchId}
                    onChange={(e) => onBranchChange(e.target.value)}
                    className="appearance-none bg-transparent text-xs font-semibold text-slate-800 pr-5 focus:outline-hidden cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nameEn} ({loc.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Authenticated User & Role Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                {session.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {session.fullName || session.username}
                </span>
                <span
                  className={`inline-block text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-sm border ${getRoleBadgeStyle(
                    session.role
                  )}`}
                >
                  {session.role}
                </span>
              </div>
            </div>

            {/* Reset Database Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(!resetConfirmOpen)}
                title="Reset LocalStorage to seed dataset"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {resetConfirmOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 text-left">
                  <p className="text-xs font-medium text-slate-800">
                    Reset baseline data?
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    This will reseed all users, branches, products, stock counts, and price overrides to factory baseline.
                  </p>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setResetConfirmOpen(false)}
                      className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetConfirmOpen(false);
                        onResetDB();
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-sm hover:bg-red-700"
                    >
                      Reset Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button (FR-AUTH-02) */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto scrollbar-none" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">{session.username}</p>
              <span className="text-[10px] text-slate-500 font-mono">{session.role}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-2.5 py-1 text-xs text-red-600 bg-red-50 rounded-md font-medium"
            >
              Logout
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Active Branch Context
            </label>
            <select
              value={activeBranchId}
              onChange={(e) => onBranchChange(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md p-2 bg-slate-50"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nameEn} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={onResetDB}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-600 border border-slate-200 rounded-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database to Baseline</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
