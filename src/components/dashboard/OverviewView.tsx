import React from 'react';
import { Session, Location, Product, User } from '../../types';
import { db } from '../../services/db';
import {
  Building2,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Shield,
  Layers,
  ArrowRight,
  Store,
  DollarSign,
  Boxes,
} from 'lucide-react';

interface OverviewViewProps {
  session: Session;
  users: User[];
  locations: Location[];
  products: Product[];
  activeBranchId: string;
  onNavigateTab: (tab: 'overview' | 'users' | 'locations' | 'products') => void;
  onOpenBranchDrawer: (loc: Location) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  session,
  users,
  locations,
  products,
  activeBranchId,
  onNavigateTab,
  onOpenBranchDrawer,
}) => {
  const activeBranch = locations.find((l) => l.id === activeBranchId) || locations[0];

  // Aggregations
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const totalBranches = locations.filter((l) => l.type === 'RETAIL_BRANCH').length;
  const totalHubs = locations.filter((l) => l.type !== 'RETAIL_BRANCH').length;

  const allInventories = db.getInventory();
  const totalNetworkUnits = allInventories.reduce((acc, curr) => acc + curr.available, 0);

  // Low stock calculation across all branches
  const lowStockItems: { product: Product; branch: Location; available: number }[] = [];
  locations.forEach((loc) => {
    const invs = db.getInventory(loc.id);
    invs.forEach((inv) => {
      const prod = products.find((p) => p.id === inv.productId);
      if (prod && inv.available < prod.minReorderLevel) {
        lowStockItems.push({
          product: prod,
          branch: loc,
          available: inv.available,
        });
      }
    });
  });

  const activeOverrides = db.getPriceOverrides().length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/10">
              Session: {session.role}
            </span>
            <span className="text-xs text-slate-300 font-ar">
              مرحباً بك في منصة الوكالة
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Welcome back, {session.username}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Managing enterprise catalog, isolated branch inventories, and location price overrides across {locations.length} facilities.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3.5 text-right self-stretch md:self-auto">
          <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
            Current Branch Context
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            {activeBranch?.nameEn}
          </p>
          <span className="text-xs font-mono text-indigo-200">
            {activeBranch?.code} · {activeBranch?.type}
          </span>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {products.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Across 5 technical categories
            </p>
          </div>
        </div>

        {/* Metric 2: Network Stock Units */}
        <div
          onClick={() => onNavigateTab('locations')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Network Stock
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalNetworkUnits.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Available units across all branches
            </p>
          </div>
        </div>

        {/* Metric 3: Facilities */}
        <div
          onClick={() => onNavigateTab('locations')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Locations & Hubs
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {locations.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalBranches} Retail, {totalHubs} Hubs & Depots
            </p>
          </div>
        </div>

        {/* Metric 4: Reorder Warnings */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reorder Alerts
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {lowStockItems.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Items below min reorder levels
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Reorder Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Reorder Alerts List (FR-PRD-08) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Low Stock Reorder Alerts (FR-PRD-08)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Branch items where available stock falls below safety minReorderLevel
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              {lowStockItems.length} Warnings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-600">Product / SKU</th>
                  <th className="px-3 py-2 font-semibold text-slate-600">Branch Location</th>
                  <th className="px-3 py-2 font-semibold text-slate-600 text-center">Available Stock</th>
                  <th className="px-3 py-2 font-semibold text-slate-600 text-center">Reorder Level</th>
                  <th className="px-3 py-2 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      All branch inventory levels are currently above reorder thresholds!
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item, idx) => (
                    <tr key={`${item.branch.id}-${item.product.id}-${idx}`} className="hover:bg-amber-50/40">
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">{item.product.nameEn}</div>
                        <div className="font-mono text-[10px] text-slate-500">{item.product.sku}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium text-slate-700">{item.branch.nameEn}</span>
                        <div className="font-mono text-[10px] text-slate-400">{item.branch.code}</div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          {item.available} {item.product.unitOfMeasure}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600">
                        {item.product.minReorderLevel} {item.product.unitOfMeasure}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenBranchDrawer(item.branch)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Platform Architecture & Modules Overview */}
        <div className="space-y-4">
          {/* Quick Module Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Core Modules
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigateTab('users')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-50 text-purple-700 group-hover:bg-purple-100">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Auth & User Management</h4>
                    <p className="text-[11px] text-slate-500">9 RBAC roles & account toggles</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('locations')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-50 text-blue-700 group-hover:bg-blue-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Branches & Warehouses</h4>
                    <p className="text-[11px] text-slate-500">Stock isolation & slide-over drawer</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('products')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Product Catalog & Categories</h4>
                    <p className="text-[11px] text-slate-500">Dynamic specs & price overrides</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          {/* LocalStorage Database Engine Status Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>LocalStorage Engine (AlWakalaDB)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              All transactions persist in client browser storage across reloads. Relational integrity, code uniqueness, and price fallback logic execute instantly in-browser.
            </p>
            <div className="pt-1 flex flex-wrap gap-1 font-mono text-[10px]">
              <span className="bg-white border px-1.5 py-0.5 rounded text-slate-700">alwakala_users</span>
              <span className="bg-white border px-1.5 py-0.5 rounded text-slate-700">alwakala_locations</span>
              <span className="bg-white border px-1.5 py-0.5 rounded text-slate-700">alwakala_products</span>
              <span className="bg-white border px-1.5 py-0.5 rounded text-slate-700">alwakala_branch_inventory</span>
              <span className="bg-white border px-1.5 py-0.5 rounded text-slate-700">alwakala_branch_prices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
