import React, { useState, useEffect } from 'react';
import { Product, Location, BranchPriceOverride } from '../../types';
import { db } from '../../services/db';
import { Modal } from '../common/Modal';
import { Tag, Check, Trash2, ArrowRight, Info, AlertCircle } from 'lucide-react';

interface BranchPriceOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  locations: Location[];
  defaultBranchId: string;
  onRefresh: () => void;
}

export const BranchPriceOverrideModal: React.FC<BranchPriceOverrideModalProps> = ({
  isOpen,
  onClose,
  product,
  locations,
  defaultBranchId,
  onRefresh,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(defaultBranchId);
  const [overrideRetail, setOverrideRetail] = useState<string>('');
  const [overrideWholesale, setOverrideWholesale] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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

  const currentBranch = locations.find((l) => l.id === selectedBranchId) || locations[0];
  const existingOverride = db.getProductPriceOverride(selectedBranchId, product.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="text-xs text-red-700 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Product summary card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{product.nameEn}</h4>
            <p className="text-xs text-slate-500 font-ar mt-0.5" dir="rtl">{product.nameAr}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="font-mono font-semibold text-slate-700">{product.sku}</span>
              <span>·</span>
              <span>Barcode: {product.primaryBarcode}</span>
              <span>·</span>
              <span>UOM: {product.unitOfMeasure}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Default Catalog Price
            </span>
            <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
              Retail: <span className="text-indigo-600">${product.defaultRetailPrice.toFixed(2)}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Wholesale: ${product.defaultWholesalePrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Select Target Branch */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Target Branch / Location <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.nameEn} ({loc.code}) — {loc.type}
              </option>
            ))}
          </select>
        </div>

        {/* Price Fallback Explainer (FR-PRD-07) */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-800">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">
              Price Fallback Rule (FR-PRD-07)
            </p>
            <p className="mt-0.5">
              When an override is set for <span className="font-semibold">{currentBranch?.code}</span>, this branch displays the override price. If left empty or cleared, the catalog automatically falls back to default prices ($
              {product.defaultRetailPrice.toFixed(2)} retail / ${product.defaultWholesalePrice.toFixed(2)} wholesale).
            </p>
          </div>
        </div>

        {/* Override Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Override Retail Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={overrideRetail}
                onChange={(e) => setOverrideRetail(e.target.value)}
                placeholder={product.defaultRetailPrice.toFixed(2)}
                className="block w-full rounded-md border border-slate-300 pl-7 pr-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Leave blank to use default (${product.defaultRetailPrice.toFixed(2)})</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Override Wholesale Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={overrideWholesale}
                onChange={(e) => setOverrideWholesale(e.target.value)}
                placeholder={product.defaultWholesalePrice.toFixed(2)}
                className="block w-full rounded-md border border-slate-300 pl-7 pr-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
            <button
              type="button"
              onClick={handleRemoveOverride}
              className="text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 hover:underline ml-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Override</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {existingOverride ? (
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
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 text-xs transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save Branch Price</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
