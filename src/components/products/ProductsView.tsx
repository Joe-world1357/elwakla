import React, { useState } from 'react';
import { Product, Location, ProductCategory } from '../../types';
import { db } from '../../services/db';
import { ProductModal } from './ProductModal';
import { BranchPriceOverrideModal } from './BranchPriceOverrideModal';
import {
  Plus,
  Search,
  Filter,
  Tag,
  AlertTriangle,
  Edit3,
  Trash2,
  SlidersHorizontal,
  Building2,
  DollarSign,
  Package,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  locations: Location[];
  activeBranchId: string;
  onRefresh: () => void;
  onOpenBranchDrawer?: (loc: Location) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  locations,
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

  const handleDeleteProduct = (prod: Product) => {
    if (window.confirm(`Are you sure you want to delete ${prod.sku} - ${prod.nameEn}?`)) {
      db.deleteProduct(prod.id);
      onRefresh();
    }
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
    const branchStock = db.getProductBranchInventory(activeBranchId, prod.id);
    const available = branchStock?.available ?? 0;
    const isLowStock = available < prod.minReorderLevel;

    if (showLowStockOnly && !isLowStock) {
      return false;
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
            Unified catalog items, dynamic category specifications, branch price fallback engine & inventory alerts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Active Branch Context Pill */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Evaluation Context:</span>
              <span className="text-xs font-bold text-slate-900">
                {activeBranch?.nameEn} ({activeBranch?.code})
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Prices and stock below reflect this branch. Overrides take precedence (FR-PRD-07); catalog prices act as automatic fallback.
            </p>
          </div>
        </div>

        {activeBranch && onOpenBranchDrawer && (
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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Low Stock Filter Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 self-start sm:self-auto">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Low Stock Warnings Only ({activeBranch?.code})
            </span>
          </label>
        </div>

        {/* Category Pills (FR-PRD-03) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold text-slate-700 uppercase tracking-wider">
                  SKU & Barcode
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-slate-700 uppercase tracking-wider">
                  Product / Technical Specs
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold text-slate-700 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold text-slate-700 uppercase tracking-wider text-center">
                  Branch Stock
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold text-slate-700 uppercase tracking-wider text-right">
                  Retail Price
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold text-slate-700 uppercase tracking-wider text-right">
                  Wholesale Price
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-slate-700 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  // Relational Stock Lookup (Branch Isolated)
                  const branchStock = db.getProductBranchInventory(activeBranchId, prod.id);
                  const availableInBranch = branchStock?.available ?? 0;
                  const onHandInBranch = branchStock?.onHand ?? 0;
                  const totalNetworkAvailable = db.getTotalAvailableStock(prod.id);

                  // FR-PRD-08 Reorder Alerts
                  const isLowStock = availableInBranch < prod.minReorderLevel;

                  // FR-PRD-07 Price Fallback Engine Evaluation
                  const effective = db.getEffectivePrice(prod.id, activeBranchId);

                  // Technical Specs summary
                  const specs = prod.technicalAttributes;
                  const specsEntries = Object.entries(specs).filter(([_, v]) => Boolean(v));

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* SKU & Barcode */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{prod.sku}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {prod.primaryBarcode}
                        </div>
                        <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                          {prod.unitOfMeasure}
                        </span>
                      </td>

                      {/* Product Name & Dynamic Specs */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-semibold text-slate-900 leading-snug">{prod.nameEn}</div>
                        <div className="text-xs text-slate-500 font-ar mt-0.5" dir="rtl">
                          {prod.nameAr}
                        </div>

                        {/* Specs List */}
                        {specsEntries.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] text-slate-600">
                            {specsEntries.map(([k, v]) => (
                              <span
                                key={k}
                                className="bg-slate-100/80 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-medium"
                              >
                                <span className="capitalize text-slate-400">{k}:</span> {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{prod.category}</span>
                      </td>

                      {/* Stock in Active Branch + Reorder Alert (FR-PRD-08) */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded ${
                              isLowStock
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {availableInBranch} {prod.unitOfMeasure}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Min: {prod.minReorderLevel} · Network: {totalNetworkAvailable}
                          </span>
                          {isLowStock && (
                            <span className="mt-1 bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded text-[10px] font-semibold inline-flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Retail Price with Fallback / Override Tag (FR-PRD-07) */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                          ${effective.retail.toFixed(2)}
                        </div>
                        {effective.isRetailOverridden ? (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded">
                            Override ({activeBranch?.code})
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 text-[10px] text-slate-400">
                            Default Catalog
                          </span>
                        )}
                      </td>

                      {/* Wholesale Price with Fallback / Override Tag (FR-PRD-07) */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="font-mono font-semibold text-slate-700 tabular-nums">
                          ${effective.wholesale.toFixed(2)}
                        </div>
                        {effective.isWholesaleOverridden ? (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded">
                            Override ({activeBranch?.code})
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 text-[10px] text-slate-400">
                            Default Catalog
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Price Override Modal Button (FR-PRD-06) */}
                          <button
                            type="button"
                            onClick={() => handleOpenOverride(prod)}
                            title="Set Branch-Specific Pricing Override"
                            className="px-2 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors inline-flex items-center gap-1 border border-indigo-200/70"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Set Override</span>
                          </button>

                          {/* Edit Product */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Catalog Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Product */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
        onRefresh={onRefresh}
      />
    </div>
  );
};
