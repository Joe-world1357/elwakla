import React from 'react';
import { Session, Location, Product, User } from '../../types';
import { db } from '../../services/db';
import {
  Building2,
  Package,
  Users,
  AlertTriangle,
  Shield,
  Layers,
  ArrowRight,
  Boxes,
  Check,
  X,
  Store,
  Lock,
} from 'lucide-react';
import { UserPermissions, getRoleDisplayName } from '../../services/auth';

interface OverviewViewProps {
  session: Session;
  users: User[];
  locations: Location[];
  products: Product[];
  permissions: UserPermissions;
  activeBranchId: string;
  onNavigateTab: (tab: 'overview' | 'users' | 'locations' | 'products') => void;
  onOpenBranchDrawer: (loc: Location) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  session,
  users,
  locations,
  products,
  permissions,
  activeBranchId,
  onNavigateTab,
  onOpenBranchDrawer,
}) => {
  const activeBranch = locations.find((l) => l.id === activeBranchId) || locations[0];
  const roleDisplay = getRoleDisplayName(session.role);

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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
              IAM: {session.role}
            </span>
            <span className="text-xs text-slate-300 font-ar" dir="rtl">
              {roleDisplay.nameAr}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Welcome, {session.fullName || session.username}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Al-Wakala Enterprise Multi-Branch Platform with active LocalStorage persistence and role-based IAM authorization.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3.5 text-right self-stretch md:self-auto">
          <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
            Current Branch Context
          </span>
          <p className="text-sm font-bold text-white mt-0.5">
            {activeBranch?.nameEn || 'No Branch Active'}
          </p>
          <span className="text-xs font-mono text-indigo-200">
            {activeBranch ? `${activeBranch.code} · ${activeBranch.type}` : 'Register a branch to begin'}
          </span>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Products */}
        <div
          onClick={() => {
            if (permissions.canViewCatalog) onNavigateTab('products');
          }}
          className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs transition-all ${
            permissions.canViewCatalog
              ? 'hover:border-indigo-300 hover:shadow-xs cursor-pointer group'
              : 'opacity-80'
          }`}
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
              {products.length === 0 ? 'Zero catalog items' : 'Across 5 technical categories'}
            </p>
          </div>
        </div>

        {/* Metric 2: Network Stock Units */}
        <div
          onClick={() => {
            if (permissions.canViewLocations) onNavigateTab('locations');
          }}
          className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs transition-all ${
            permissions.canViewLocations
              ? 'hover:border-indigo-300 hover:shadow-xs cursor-pointer group'
              : 'opacity-80'
          }`}
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
          onClick={() => {
            if (permissions.canViewLocations) onNavigateTab('locations');
          }}
          className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs transition-all ${
            permissions.canViewLocations
              ? 'hover:border-indigo-300 hover:shadow-xs cursor-pointer group'
              : 'opacity-80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Facilities
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
              {locations.length === 0 ? 'No branches configured' : `${totalBranches} Retail, ${totalHubs} Hubs`}
            </p>
          </div>
        </div>

        {/* Metric 4: Reorder Warnings */}
        <div
          onClick={() => {
            if (permissions.canViewCatalog) onNavigateTab('products');
          }}
          className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs transition-all ${
            permissions.canViewCatalog
              ? 'hover:border-amber-300 hover:shadow-xs cursor-pointer group'
              : 'opacity-80'
          }`}
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

      {/* Two Column Layout: Reorder Alerts & IAM Privileges Overview */}
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
                  <th scope="col" className="px-3 py-2.5 font-semibold text-slate-700">
                    Product / SKU
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold text-slate-700">
                    Branch Facility
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold text-slate-700 text-center">
                    Available Stock
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold text-slate-700 text-center">
                    Min Threshold
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold text-slate-700 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      {products.length === 0
                        ? 'No catalog items registered. Add products to catalog to enable stock tracking.'
                        : 'All branch inventory levels are currently above minimum safety thresholds.'}
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item, idx) => (
                    <tr key={`${item.branch.id}-${item.product.id}-${idx}`} className="hover:bg-slate-50/80">
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">{item.product.nameEn}</div>
                        <div className="font-mono text-[11px] text-slate-400">{item.product.sku}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-slate-800">{item.branch.nameEn}</span>
                        <span className="font-mono text-[11px] text-slate-400 block">
                          {item.branch.code}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {item.available} {item.product.unitOfMeasure}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600">
                        {item.product.minReorderLevel} {item.product.unitOfMeasure}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {permissions.canAdjustInventory ? (
                          <button
                            type="button"
                            onClick={() => onOpenBranchDrawer(item.branch)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            Restock
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Notice</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: IAM Active Permissions & Modules */}
        <div className="space-y-4">
          {/* Active Session IAM Privileges Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Your IAM Authorization</span>
              </h3>
              <span className="font-mono text-[11px] bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded font-bold">
                {session.role}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">User Directory & IAM:</span>
                {permissions.canManageUsers ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Full Management
                  </span>
                ) : permissions.canViewUsers ? (
                  <span className="text-blue-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Read-Only
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Restricted
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Branch & Facilities:</span>
                {permissions.canManageLocations ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Full Management
                  </span>
                ) : permissions.canViewLocations ? (
                  <span className="text-blue-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Read-Only
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Restricted
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Product Catalog:</span>
                {permissions.canManageCatalog ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Full Management
                  </span>
                ) : (
                  <span className="text-blue-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Browse Only
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Cost Price Oversight:</span>
                {permissions.canViewCostPrice ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Visible
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Confidential / Masked
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Physical Stock Adjustments:</span>
                {permissions.canAdjustInventory ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Authorized
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Read-Only Count
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Branch Price Overrides:</span>
                {permissions.canSetPriceOverrides ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Configurable
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Fallback Default
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Module Navigation */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Accessible Modules
            </h3>

            <div className="space-y-2">
              {permissions.canViewUsers && (
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
                      <p className="text-[11px] text-slate-500">RBAC directory & credentials</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>
              )}

              {permissions.canViewLocations && (
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
                      <p className="text-[11px] text-slate-500">Stock isolation & store footprints</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>
              )}

              {permissions.canViewCatalog && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
