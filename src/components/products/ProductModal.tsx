import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, TechnicalAttributes } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle, Check, Sparkles } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onSave: (productData: {
    sku: string;
    primaryBarcode: string;
    nameAr: string;
    nameEn: string;
    category: ProductCategory;
    unitOfMeasure: string;
    minReorderLevel: number;
    avgCostPrice: number;
    defaultWholesalePrice: number;
    defaultRetailPrice: number;
    technicalAttributes: TechnicalAttributes;
  }) => { success: boolean; error?: string };
}

const CATEGORIES: ProductCategory[] = ['Electrical', 'Plumbing', 'Hardware', 'Paints', 'Tools'];
const COMMON_UOM = ['Piece', 'Meter', 'Box', 'Can', 'Roll', 'Kg', 'Set', 'Pack'];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}) => {
  const [sku, setSku] = useState('');
  const [primaryBarcode, setPrimaryBarcode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electrical');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Piece');
  const [minReorderLevel, setMinReorderLevel] = useState<number>(20);
  const [avgCostPrice, setAvgCostPrice] = useState<number>(50);
  const [defaultWholesalePrice, setDefaultWholesalePrice] = useState<number>(70);
  const [defaultRetailPrice, setDefaultRetailPrice] = useState<number>(90);

  // Dynamic Technical Attributes (FR-PRD-04)
  const [techAttrs, setTechAttrs] = useState<TechnicalAttributes>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setPrimaryBarcode(productToEdit.primaryBarcode);
      setNameAr(productToEdit.nameAr);
      setNameEn(productToEdit.nameEn);
      setCategory(productToEdit.category);
      setUnitOfMeasure(productToEdit.unitOfMeasure);
      setMinReorderLevel(productToEdit.minReorderLevel);
      setAvgCostPrice(productToEdit.avgCostPrice);
      setDefaultWholesalePrice(productToEdit.defaultWholesalePrice);
      setDefaultRetailPrice(productToEdit.defaultRetailPrice);
      setTechAttrs(productToEdit.technicalAttributes || {});
    } else {
      setSku('');
      setPrimaryBarcode('');
      setNameAr('');
      setNameEn('');
      setCategory('Electrical');
      setUnitOfMeasure('Piece');
      setMinReorderLevel(25);
      setAvgCostPrice(30);
      setDefaultWholesalePrice(45);
      setDefaultRetailPrice(60);
      setTechAttrs({ voltage: '220V', gauge: '2.5mm', color: 'Blue' });
    }
    setError(null);
  }, [productToEdit, isOpen]);

  // Adjust defaults when category changes during new creation
  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    if (!productToEdit) {
      if (newCat === 'Electrical') {
        setTechAttrs({ voltage: '220V', gauge: '2.5mm', color: 'Blue' });
        setUnitOfMeasure('Meter');
      } else if (newCat === 'Plumbing') {
        setTechAttrs({ diameter: '25mm (3/4")', pressureRating: 'PN16', material: 'PPR' });
        setUnitOfMeasure('Piece');
      } else if (newCat === 'Paints') {
        setTechAttrs({ baseType: 'Water-Based Latex', finish: 'Matte / Silk', volume: '10 Liters' });
        setUnitOfMeasure('Can');
      } else if (newCat === 'Hardware') {
        setTechAttrs({ dimensions: 'M8 x 40mm', grade: 'High Tensile Steel' });
        setUnitOfMeasure('Box');
      } else if (newCat === 'Tools') {
        setTechAttrs({ powerSource: '20V Cordless Li-Ion', wattage: '600W equivalent', dimensions: 'Compact' });
        setUnitOfMeasure('Piece');
      }
    }
  };

  const updateAttr = (key: string, val: string) => {
    setTechAttrs((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim()) {
      setError('Product SKU is required.');
      return;
    }
    if (!primaryBarcode.trim()) {
      setError('Primary barcode is required.');
      return;
    }
    if (!nameEn.trim()) {
      setError('Product name (English) is required.');
      return;
    }
    if (!nameAr.trim()) {
      setError('Product name (Arabic) is required.');
      return;
    }

    const res = onSave({
      sku: sku.trim().toUpperCase(),
      primaryBarcode: primaryBarcode.trim(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      category,
      unitOfMeasure: unitOfMeasure.trim(),
      minReorderLevel: Number(minReorderLevel) || 0,
      avgCostPrice: Number(avgCostPrice) || 0,
      defaultWholesalePrice: Number(defaultWholesalePrice) || 0,
      defaultRetailPrice: Number(defaultRetailPrice) || 0,
      technicalAttributes: techAttrs,
    });

    if (!res.success) {
      setError(res.error || 'Failed to save product.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? `Edit Product: ${productToEdit.sku}` : 'Add New Product to Catalog'}
      subtitle="Catalog registry with dynamic technical specifications & baseline pricing"
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Identification: SKU & Barcode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              SKU Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. ELC-CBL-4MM"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Primary Barcode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={primaryBarcode}
              onChange={(e) => setPrimaryBarcode(e.target.value)}
              placeholder="e.g. 6291000123456"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Names (English & Arabic) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Product Name (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Electrical Cable 4mm Copper Insulated"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-ar">
            اسم المنتج بالعربية (Arabic Name) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: كابل كهرباء 4 مم نحاس معزول"
            dir="rtl"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-ar"
          />
        </div>

        {/* Category & Unit of Measure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category Group (FR-PRD-03) <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Unit of Measure (UOM) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="uom-options"
              required
              value={unitOfMeasure}
              onChange={(e) => setUnitOfMeasure(e.target.value)}
              placeholder="e.g. Meter, Piece, Can"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <datalist id="uom-options">
              {COMMON_UOM.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Dynamic Technical Attributes Box (FR-PRD-04) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Dynamic Technical Attributes ({category})
            </span>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">
              Category Specific Inputs
            </span>
          </div>

          {category === 'Electrical' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Voltage</label>
                <input
                  type="text"
                  value={techAttrs.voltage || ''}
                  onChange={(e) => updateAttr('voltage', e.target.value)}
                  placeholder="e.g. 220V / 380V"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gauge / Size</label>
                <input
                  type="text"
                  value={techAttrs.gauge || ''}
                  onChange={(e) => updateAttr('gauge', e.target.value)}
                  placeholder="e.g. 4mm²"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Color</label>
                <input
                  type="text"
                  value={techAttrs.color || ''}
                  onChange={(e) => updateAttr('color', e.target.value)}
                  placeholder="e.g. Red, Black, Yellow"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
            </div>
          )}

          {category === 'Plumbing' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Diameter</label>
                <input
                  type="text"
                  value={techAttrs.diameter || ''}
                  onChange={(e) => updateAttr('diameter', e.target.value)}
                  placeholder="e.g. 32mm (1 inch)"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pressure Rating</label>
                <input
                  type="text"
                  value={techAttrs.pressureRating || ''}
                  onChange={(e) => updateAttr('pressureRating', e.target.value)}
                  placeholder="e.g. PN20 (20 Bar)"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Material</label>
                <input
                  type="text"
                  value={techAttrs.material || ''}
                  onChange={(e) => updateAttr('material', e.target.value)}
                  placeholder="e.g. PPR Random Copolymer"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
            </div>
          )}

          {category === 'Paints' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Type</label>
                <input
                  type="text"
                  value={techAttrs.baseType || ''}
                  onChange={(e) => updateAttr('baseType', e.target.value)}
                  placeholder="e.g. Oil-Based Alkyd"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Finish</label>
                <input
                  type="text"
                  value={techAttrs.finish || ''}
                  onChange={(e) => updateAttr('finish', e.target.value)}
                  placeholder="e.g. High Gloss / Eggshell"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Volume</label>
                <input
                  type="text"
                  value={techAttrs.volume || ''}
                  onChange={(e) => updateAttr('volume', e.target.value)}
                  placeholder="e.g. 3.75 Liters"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
            </div>
          )}

          {category === 'Hardware' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dimensions / Thread</label>
                <input
                  type="text"
                  value={techAttrs.dimensions || ''}
                  onChange={(e) => updateAttr('dimensions', e.target.value)}
                  placeholder="e.g. M10 x 50mm"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Grade / Material</label>
                <input
                  type="text"
                  value={techAttrs.grade || ''}
                  onChange={(e) => updateAttr('grade', e.target.value)}
                  placeholder="e.g. Grade 8.8 Galvanized"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
            </div>
          )}

          {category === 'Tools' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Power Source</label>
                <input
                  type="text"
                  value={techAttrs.powerSource || ''}
                  onChange={(e) => updateAttr('powerSource', e.target.value)}
                  placeholder="e.g. Corded 220V or Battery"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Wattage / Rating</label>
                <input
                  type="text"
                  value={techAttrs.wattage || ''}
                  onChange={(e) => updateAttr('wattage', e.target.value)}
                  placeholder="e.g. 850 Watts"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chuck / Format</label>
                <input
                  type="text"
                  value={techAttrs.dimensions || ''}
                  onChange={(e) => updateAttr('dimensions', e.target.value)}
                  placeholder="e.g. Keyless 13mm"
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Min Reorder Level */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Min Reorder <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={minReorderLevel}
              onChange={(e) => setMinReorderLevel(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Avg Cost Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={avgCostPrice}
              onChange={(e) => setAvgCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Default Wholesale
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={defaultWholesalePrice}
              onChange={(e) => setDefaultWholesalePrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Default Retail <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={defaultRetailPrice}
              onChange={(e) => setDefaultRetailPrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono tabular-nums shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
            <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
