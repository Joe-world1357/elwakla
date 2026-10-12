import React, { useState } from 'react';
import { Location, Product, BranchInventory } from '../../types';
import { db } from '../../services/db';
import { Drawer } from '../common/Drawer';
import {
  Package,
  AlertTriangle,
  Check,
  Search,
  Plus,
  Save,
  ShieldCheck,
  Layers,
} from 'lucide-react';

import { UserPermissions } from '../../services/auth';

interface BranchInventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  products: Product[];
  permissions: UserPermissions;
  onRefresh: () => void;
}

export const BranchInventoryDrawer: React.FC<BranchInventoryDrawerProps> = ({
  isOpen,
  onClose,
  location,
  products,
  permissions,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStock, setEditingStock] = useState<{
    [productId: string]: { onHand: number; reserved: number };
  }>({});
  const [successSavedId, setSuccessSavedId] = useState<string | null>(null);

  if (!location) return null;

  // Retrieve current isolated inventories strictly for this branch (FR-LOC-05)
  const branchInventories = db.getInventory(location.id);

  const inventoryMap = new Map<string, BranchInventory>();
  branchInventories.forEach((inv) => inventoryMap.set(inv.productId, inv));

  const filteredProducts = products.filter((p) => {
    return (
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameAr.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleStockInputChange = (
    productId: string,
    field: 'onHand' | 'reserved',
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const current = editingStock[productId] || {
      onHand: inventoryMap.get(productId)?.onHand ?? 0,
      reserved: inventoryMap.get(productId)?.reserved ?? 0,
    };

    setEditingStock((prev) => ({
      ...prev,
      [productId]: {
        ...current,
        [field]: num,
      },
    }));
  };

  const handleSaveStock = (productId: string) => {
    const edit = editingStock[productId];
    const onHand = edit !== undefined ? edit.onHand : (inventoryMap.get(productId)?.onHand ?? 0);
    const reserved = edit !== undefined ? edit.reserved : (inventoryMap.get(productId)?.reserved ?? 0);

    // Persist strictly to alwakala_branch_inventory for this location (FR-LOC-06)
    db.setProductInventory(location.id, productId, onHand, reserved);
    setSuccessSavedId(productId);
    setTimeout(() => setSuccessSavedId(null), 1800);
    onRefresh();
  };

  const totalOnHandInBranch = branchInventories.reduce((acc, curr) => acc + curr.onHand, 0);
  const totalAvailableInBranch = branchInventories.reduce((acc, curr) => acc + curr.available, 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${location.nameEn} (${location.code})`}
      subtitle={`Isolated Branch Stock Inventory — ${location.type.replace('_', ' ')}`}
      widthClass="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Branch Context Banner & Isolation Explainer */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
          <Layers className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 w-full">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-indigo-950">
                Isolated Stock Counts Active (FR-LOC-06)
              </p>
              {!permissions.canAdjustInventory && (
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-semibold">
                  Read-Only Mode
                </span>
              )}
            </div>
            <p className="mt-0.5 text-indigo-800">
              Stock values edited in this drawer affect only <span className="font-bold">{location.code}</span> in <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded">alwakala_branch_inventory</code>. Other branches retain their isolated counts.
            </p>
            {!permissions.canAdjustInventory && (
              <p className="mt-1 text-[11px] text-amber-800 font-medium bg-amber-50/80 border border-amber-200/60 p-1.5 rounded">
                🔒 You are currently viewing in read-only mode. Modifying inventory requires ROLE_WH_KEEPER, ROLE_BRANCH_MGR, ROLE_PURCHASER, or ROLE_ADMIN.
              </p>
            )}
            <div className="mt-2.5 flex items-center gap-4 text-xs font-mono">
              <span className="font-semibold text-indigo-950">
                Total On-Hand: <span className="tabular-nums font-bold">{totalOnHandInBranch}</span>
              </span>
              <span>·</span>
              <span className="font-semibold text-emerald-800">
                Total Available: <span className="tabular-nums font-bold">{totalAvailableInBranch}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items by SKU, name, or category..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Items Stock Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">
                  Product / SKU
                </th>
                <th scope="col" className="px-3 py-3 text-center font-semibold text-slate-700 uppercase tracking-wider">
                  On Hand
                </th>
                <th scope="col" className="px-3 py-3 text-center font-semibold text-slate-700 uppercase tracking-wider">
                  Reserved
                </th>
                <th scope="col" className="px-3 py-3 text-center font-semibold text-slate-700 uppercase tracking-wider">
                  Available
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold text-slate-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    {products.length === 0
                      ? 'No products registered in catalog yet. Add products to catalog first.'
                      : 'No products found matching filter.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const inv = inventoryMap.get(prod.id);
                  const isModified = editingStock[prod.id] !== undefined;
                  const currentOnHand = isModified ? editingStock[prod.id].onHand : (inv?.onHand ?? 0);
                  const currentReserved = isModified ? editingStock[prod.id].reserved : (inv?.reserved ?? 0);
                  const currentAvailable = Math.max(0, currentOnHand - currentReserved);

                  const isLowStock = currentAvailable < prod.minReorderLevel;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{prod.nameEn}</span>
                          <span className="text-[11px] text-slate-500 font-ar">{prod.nameAr}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span className="font-mono text-slate-600">{prod.sku}</span>
                            <span>·</span>
                            <span>{prod.category}</span>
                            <span>·</span>
                            <span>Min: {prod.minReorderLevel} {prod.unitOfMeasure}</span>
                          </div>
                          {isLowStock && (
                            <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 mt-1 font-semibold">
                              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>Below Reorder Level ({prod.minReorderLevel})</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* On Hand Input */}
                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          disabled={!permissions.canAdjustInventory}
                          value={currentOnHand}
                          onChange={(e) => handleStockInputChange(prod.id, 'onHand', e.target.value)}
                          className={`w-18 text-center px-2 py-1 border rounded-md font-mono text-xs tabular-nums focus:outline-hidden ${
                            permissions.canAdjustInventory
                              ? 'border-slate-300 focus:border-indigo-500 bg-white'
                              : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                          }`}
                        />
                      </td>

                      {/* Reserved Input */}
                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max={currentOnHand}
                          disabled={!permissions.canAdjustInventory}
                          value={currentReserved}
                          onChange={(e) => handleStockInputChange(prod.id, 'reserved', e.target.value)}
                          className={`w-18 text-center px-2 py-1 border rounded-md font-mono text-xs tabular-nums focus:outline-hidden ${
                            permissions.canAdjustInventory
                              ? 'border-slate-300 focus:border-indigo-500 bg-white'
                              : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                          }`}
                        />
                      </td>

                      {/* Available (Computed) */}
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`font-mono text-xs font-bold tabular-nums px-2 py-0.5 rounded ${
                            isLowStock
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {currentAvailable} {prod.unitOfMeasure}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3.5 text-right whitespace-nowrap">
                        {permissions.canAdjustInventory ? (
                          <button
                            type="button"
                            onClick={() => handleSaveStock(prod.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors shadow-2xs ${
                              successSavedId === prod.id
                                ? 'bg-emerald-600 text-white'
                                : isModified
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {successSavedId === prod.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Update</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-medium">Read Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Drawer>
  );
};
