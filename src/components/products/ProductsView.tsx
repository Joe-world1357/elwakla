import React, { useState } from 'react';
import { Session, Product, Location, ProductCategory } from '../../types';
import { db } from '../../services/db';
import { ProductModal } from './ProductModal';
import { BranchPriceOverrideModal } from './BranchPriceOverrideModal';
import { UserPermissions } from '../../services/auth';
import {
  Plus,
  Search,
  Filter,
  Tag,
  AlertTriangle,
  Edit3,
  Trash2,
  Building2,
  Package,
  Layers,
  Lock,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface ProductsViewProps {
  products: Product[];
  locations: Location[];
  session: Session;
  permissions: UserPermissions;
  activeBranchId: string;
  onRefresh: () => void;
  onOpenBranchDrawer?: (loc: Location) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  locations,
  session,
  permissions,
  activeBranchId,
  onRefresh,
  onOpenBranchDrawer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedProductForOverride, setSelectedProductForOverride] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  if (!permissions.canViewCatalog) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">IAM Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your current role (<span className="font-mono font-semibold text-slate-700">{session.role}</span>) does not have permission to view the product catalog.
        </p>
      </div>
    );
  }

  const activeBranch = locations.find((l) => l.id === activeBranchId) || locations[0];

  const categories: (ProductCategory | 'ALL')[] = [
    'ALL',
    'Electrical',
    'Plumbing',
    'Hardware',
    'Paints',
    'Tools',
  ];

  const handleOpenAdd = () => {
    setSelectedProductForEdit(null);
    setProductModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setSelectedProductForEdit(prod);
    setProductModalOpen(true);
  };

  const handleOpenOverride = (prod: Product) => {
    setSelectedProductForOverride(prod);
    setOverrideModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    db.deleteProduct(deleteCandidate.id);
    setDeleteCandidate(null);
    onRefresh();
  };

  const handleSaveProduct = (productData: any) => {
    if (selectedProductForEdit) {
      const res = db.updateProduct(selectedProductForEdit.id, productData);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = db.createProduct(productData);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  // Filter products (FR-PRD-05)
  const filteredProducts = products.filter((prod) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      prod.sku.toLowerCase().includes(term) ||
      prod.primaryBarcode.includes(term) ||
      prod.nameEn.toLowerCase().includes(term) ||
      prod.nameAr.includes(term) ||
      prod.category.toLowerCase().includes(term);

    const matchesCategory = categoryFilter === 'ALL' || prod.category === categoryFilter;

    // Check low-stock alert (FR-PRD-08)
    if (activeBranchId) {
      const branchStock = db.getProductBranchInventory(activeBranchId, prod.id);
      const available = branchStock?.available ?? 0;
      const isLowStock = available < prod.minReorderLevel;

      if (showLowStockOnly && !isLowStock) {
        return false;
      }
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="sm:flex sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Product Catalog & Categories
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Unified catalog items, dynamic technical specifications, branch price fallback engine & inventory alerts
          </p>
        </div>
        {permissions.canManageCatalog && (
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-3.5 py-2 text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Branch Context Pill */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Evaluation Context:</span>
              <span className="text-xs font-bold text-slate-900">
                {activeBranch ? `${activeBranch.nameEn} (${activeBranch.code})` : 'No Active Branch'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {activeBranch
                ? 'Stock and prices below reflect this branch. Overrides take precedence; catalog default acts as automatic fallback.'
                : 'Zero branches registered in LocalStorage. Register a branch in Branches & Warehouses to track isolated stock and price overrides.'}
            </p>
          </div>
        </div>

        {activeBranch && onOpenBranchDrawer && permissions.canAdjustInventory && (
          <button
            type="button"
            onClick={() => onOpenBranchDrawer(activeBranch)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/50"
          >
            Adjust Branch Stock Drawer
          </button>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Instant Filter Search Bar (FR-PRD-05) */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by SKU, Barcode, Name, Category..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Low Stock Filter Checkbox */}
          {activeBranch && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 self-start sm:self-auto">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Show Low-Stock Only ({activeBranch.code})</span>
              </span>
            </label>
          )}
        </div>

        {/* Category Pills (FR-PRD-03) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => {
            const count =
              cat === 'ALL' ? products.length : products.filter((p) => p.category === cat).length;
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">SKU & Barcode</th>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Category & Specs</th>
                <th className="px-5 py-3.5 text-center">Available Stock</th>
                {permissions.canViewCostPrice && (
                  <th className="px-5 py-3.5 text-right">Avg Cost</th>
                )}
                <th className="px-5 py-3.5 text-right">Wholesale Price</th>
                <th className="px-5 py-3.5 text-right">Retail Price</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={permissions.canViewCostPrice ? 8 : 7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                        <Package className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-slate-700">No products found</p>
                      <p className="text-xs text-slate-400">
                        {products.length === 0
                          ? 'Zero items in catalog (Clean state). Click "+ Add Product" to add your first item.'
                          : 'Try modifying your search query or category filter.'}
                      </p>
                      {permissions.canManageCatalog && products.length === 0 && (
                        <button
                          type="button"
                          onClick={handleOpenAdd}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Product</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  // Evaluate price override fallback for current branch (FR-PRD-07)
                  const effectivePrice = activeBranchId
                    ? db.getEffectivePrice(activeBranchId, prod.id)
                    : {
                        retail: prod.defaultRetailPrice,
                        wholesale: prod.defaultWholesalePrice,
                        isRetailOverridden: false,
                        isWholesaleOverridden: false,
                      };

                  // Branch isolated inventory (FR-LOC-05)
                  const branchStock = activeBranchId
                    ? db.getProductBranchInventory(activeBranchId, prod.id)
                    : null;
                  const availableUnits = branchStock?.available ?? 0;
                  const isLowStock = activeBranch && availableUnits < prod.minReorderLevel;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SKU & Barcode */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {prod.sku}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {prod.primaryBarcode}
                        </div>
                      </td>

                      {/* Product Name (Bilingual) */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{prod.nameEn}</div>
                        <div className="text-slate-500 font-ar text-[11px] mt-0.5" dir="rtl">
                          {prod.nameAr}
                        </div>
                      </td>

                      {/* Category & Dynamic Tech Specs (FR-PRD-04) */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px]">
                            {prod.category}
                          </span>
                          <span className="text-slate-400 text-[10px]">({prod.unitOfMeasure})</span>
                        </div>
                        {/* Dynamic specs summary */}
                        <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-600">
                          {Object.entries(prod.technicalAttributes || {}).map(([key, val]) => {
                            if (!val) return null;
                            return (
                              <span
                                key={key}
                                className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded"
                              >
                                {key}: <strong>{val}</strong>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Available Stock + Low Stock Alert (FR-PRD-08) */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-bold text-sm text-slate-800">
                            {availableUnits}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Min: {prod.minReorderLevel}
                          </span>
                          {isLowStock && (
                            <span className="mt-1 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              <span>Low Stock</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Avg Cost Price (IAM-Gated: Confidential to authorized roles) */}
                      {permissions.canViewCostPrice && (
                        <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-slate-600">
                          ${prod.avgCostPrice.toFixed(2)}
                        </td>
                      )}

                      {/* Wholesale Price (Evaluated Override vs Fallback) */}
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900">
                            ${effectivePrice.wholesale.toFixed(2)}
                          </span>
                          {effectivePrice.isWholesaleOverridden ? (
                            <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                              Branch Override
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400">Catalog Default</span>
                          )}
                        </div>
                      </td>

                      {/* Retail Price (Evaluated Override vs Fallback) */}
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-indigo-700">
                            ${effectivePrice.retail.toFixed(2)}
                          </span>
                          {effectivePrice.isRetailOverridden ? (
                            <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                              Branch Override
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400">Catalog Default</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Price Override button */}
                          {permissions.canSetPriceOverrides ? (
                            <button
                              type="button"
                              onClick={() => handleOpenOverride(prod)}
                              className="px-2 py-1 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-md font-medium text-[11px] transition-colors inline-flex items-center gap-1"
                              title="Set Branch Price Override"
                            >
                              <Tag className="w-3 h-3 text-slate-500" />
                              <span>Override</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenOverride(prod)}
                              className="px-2 py-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-md text-[11px] inline-flex items-center gap-1"
                              title="View Price Overrides"
                            >
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span>View Prices</span>
                            </button>
                          )}

                          {/* Edit Product - Only if authorized */}
                          {permissions.canManageCatalog && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Product - Only if authorized */}
                          {permissions.canManageCatalog && (
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(prod)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {!permissions.canSetPriceOverrides && !permissions.canManageCatalog && (
                            <span className="text-slate-400 text-[11px] font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              Read Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Product Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          title={`Delete Product: ${deleteCandidate.sku}`}
          subtitle="Are you sure you want to permanently remove this catalog item?"
          maxWidthClass="max-w-md"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1 text-xs">
              <p><strong>SKU:</strong> {deleteCandidate.sku}</p>
              <p><strong>Name:</strong> {deleteCandidate.nameEn}</p>
              <p><strong>Category:</strong> {deleteCandidate.category}</p>
            </div>
            <p className="text-xs text-slate-500">
              Deleting this item will cascade delete all isolated branch inventory records and localized price overrides for this SKU across all branches.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-2xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={selectedProductForEdit}
        onSave={handleSaveProduct}
      />

      {/* Branch Price Override Modal */}
      <BranchPriceOverrideModal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        product={selectedProductForOverride}
        locations={locations}
        defaultBranchId={activeBranchId}
        permissions={permissions}
        onRefresh={onRefresh}
      />
    </div>
  );
};
