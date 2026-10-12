import React, { useState, useEffect } from 'react';
import { Product, Location, BranchPriceOverride } from '../../types';
import { db } from '../../services/db';
import { Modal } from '../common/Modal';
import { Tag, Check, Trash2, ArrowRight, Info, AlertCircle, Lock } from 'lucide-react';
import { UserPermissions } from '../../services/auth';

interface BranchPriceOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  locations: Location[];
  defaultBranchId: string;
  permissions?: UserPermissions;
  onRefresh: () => void;
}

export const BranchPriceOverrideModal: React.FC<BranchPriceOverrideModalProps> = ({
  isOpen,
  onClose,
  product,
  locations,
  defaultBranchId,
  permissions,
  onRefresh,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(defaultBranchId);
  const [overrideRetail, setOverrideRetail] = useState<string>('');
  const [overrideWholesale, setOverrideWholesale] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const canEdit = permissions ? permissions.canSetPriceOverrides : true;

  useEffect(() => {
    if (product) {
      setSelectedBranchId(defaultBranchId || (locations[0]?.id ?? ''));
    }
  }, [product, defaultBranchId, locations, isOpen]);

  // Load existing override for selected branch + product
  useEffect(() => {
    if (product && selectedBranchId) {
      const existing = db.getProductPriceOverride(selectedBranchId, product.id);
      if (existing) {
        setOverrideRetail(
          existing.overrideRetailPrice !== undefined ? String(existing.overrideRetailPrice) : ''
        );
        setOverrideWholesale(
          existing.overrideWholesalePrice !== undefined ? String(existing.overrideWholesalePrice) : ''
        );
      } else {
        setOverrideRetail('');
        setOverrideWholesale('');
      }
    }
  }, [product, selectedBranchId]);

  if (!product) return null;

  if (locations.length === 0) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Branch-Specific Price Override"
        subtitle={`Configure localized pricing override for ${product.sku}`}
        maxWidthClass="max-w-md"
      >
        <div className="p-4 text-center space-y-3">
          <p className="text-xs text-slate-500">
            No physical branches are currently registered in LocalStorage. Please create a retail branch or warehouse before configuring branch-specific price overrides.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  const currentBranch = locations.find((l) => l.id === selectedBranchId) || locations[0];
  const existingOverride = selectedBranchId ? db.getProductPriceOverride(selectedBranchId, product.id) : undefined;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setError(null);

    const retailVal = overrideRetail.trim() ? parseFloat(overrideRetail) : undefined;
    const wholesaleVal = overrideWholesale.trim() ? parseFloat(overrideWholesale) : undefined;

    if (retailVal !== undefined && isNaN(retailVal)) {
      setError('Invalid retail price override value.');
      return;
    }
    if (wholesaleVal !== undefined && isNaN(wholesaleVal)) {
      setError('Invalid wholesale price override value.');
      return;
    }

    if (retailVal === undefined && wholesaleVal === undefined) {
      // If both blank, remove override
      db.deletePriceOverride(selectedBranchId, product.id);
    } else {
      db.setPriceOverride(selectedBranchId, product.id, retailVal, wholesaleVal);
    }

    onRefresh();
    onClose();
  };

  const handleRemoveOverride = () => {
    if (!canEdit) return;
    db.deletePriceOverride(selectedBranchId, product.id);
    setOverrideRetail('');
    setOverrideWholesale('');
    onRefresh();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Branch-Specific Price Override"
      subtitle={`Configure localized pricing override for ${product.sku}`}
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">{error}</div>
          </div>
        )}

        {!canEdit && (
          <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Read-Only: Your current role cannot modify branch price overrides.</span>
          </div>
        )}

        {/* Product Reference Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
              {product.sku}
            </span>
            <p className="text-xs font-bold text-slate-800 mt-1">{product.nameEn}</p>
            <p className="text-[11px] text-slate-500 font-ar" dir="rtl">{product.nameAr}</p>
          </div>
          <div className="text-right text-xs font-mono space-y-0.5">
            <div>
              <span className="text-slate-400 text-[10px]">Catalog Retail: </span>
              <strong className="text-slate-800">${product.defaultRetailPrice.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Catalog Wholesale: </span>
              <strong className="text-slate-800">${product.defaultWholesalePrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Branch Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Target Branch / Location
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.nameEn} ({loc.code}) — {loc.type}
              </option>
            ))}
          </select>
        </div>

        {/* Override Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Override Retail Price ($)
            </label>
            <div className="relative rounded-md shadow-2xs">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400 font-mono">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={!canEdit}
                value={overrideRetail}
                onChange={(e) => setOverrideRetail(e.target.value)}
                placeholder={product.defaultRetailPrice.toFixed(2)}
                className="block w-full rounded-md border border-slate-300 pl-7 pr-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Leave blank to use default (${product.defaultRetailPrice.toFixed(2)})</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Override Wholesale Price ($)
            </label>
            <div className="relative rounded-md shadow-2xs">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400 font-mono">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={!canEdit}
                value={overrideWholesale}
                onChange={(e) => setOverrideWholesale(e.target.value)}
                placeholder={product.defaultWholesalePrice.toFixed(2)}
                className="block w-full rounded-md border border-slate-300 pl-7 pr-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Leave blank to use default (${product.defaultWholesalePrice.toFixed(2)})</p>
          </div>
        </div>

        {/* Existing override status */}
        {existingOverride && (
          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <span>
              Active override exists for {currentBranch?.code}: Retail $
              {existingOverride.overrideRetailPrice ?? product.defaultRetailPrice} / Wholesale $
              {existingOverride.overrideWholesalePrice ?? product.defaultWholesalePrice}
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={handleRemoveOverride}
                className="text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 hover:underline ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Override</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {existingOverride && canEdit ? (
            <button
              type="button"
              onClick={handleRemoveOverride}
              className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Revert to Default</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              {canEdit ? 'Cancel' : 'Close'}
            </button>
            {canEdit && (
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 text-xs transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Save Branch Price</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
