import React, { useState, useEffect } from 'react';
import { Location, LocationType } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit: Location | null;
  onSave: (locationData: {
    code: string;
    nameAr: string;
    nameEn: string;
    type: LocationType;
    address: string;
    phone: string;
    isActive?: boolean;
  }) => { success: boolean; error?: string };
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  locationToEdit,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<LocationType>('RETAIL_BRANCH');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationToEdit) {
      setCode(locationToEdit.code);
      setNameAr(locationToEdit.nameAr);
      setNameEn(locationToEdit.nameEn);
      setType(locationToEdit.type);
      setAddress(locationToEdit.address);
      setPhone(locationToEdit.phone);
      setIsActive(locationToEdit.isActive);
    } else {
      setCode('BR-GIZA-01');
      setNameAr('');
      setNameEn('');
      setType('RETAIL_BRANCH');
      setAddress('');
      setPhone('+202');
      setIsActive(true);
    }
    setError(null);
  }, [locationToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Branch/Warehouse unique code is required.');
      return;
    }
    if (!nameEn.trim()) {
      setError('English name is required.');
      return;
    }
    if (!nameAr.trim()) {
      setError('Arabic name (اسم الفرع بالعربية) is required.');
      return;
    }
    if (!address.trim()) {
      setError('Physical address is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    const res = onSave({
      code: code.trim().toUpperCase(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      type,
      address: address.trim(),
      phone: phone.trim(),
      isActive,
    });

    if (!res.success) {
      setError(res.error || 'Failed to save location.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={locationToEdit ? `Edit Location: ${locationToEdit.code}` : 'Add New Location'}
      subtitle="Register a retail branch, distribution hub, or specialized warehouse"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 leading-relaxed">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location Code (FR-LOC-03) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Location Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. BR-CAIRO-01"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase"
            />
            <p className="text-[10px] text-slate-400 mt-1">Unique identifier in alwakala_locations</p>
          </div>

          {/* Type Classification (FR-LOC-02) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Classification Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LocationType)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="RETAIL_BRANCH">Retail Branch (فرع تجزئة)</option>
              <option value="DISTRIBUTION_HUB">Distribution Hub (مركز توزيع رئيسي)</option>
              <option value="SPECIALIZED_WAREHOUSE">Specialized Warehouse (مستودع متخصص)</option>
            </select>
          </div>
        </div>

        {/* English Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Location Name (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Cairo Flagship Branch"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Arabic Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-ar">
            الاسم بالعربية (Arabic Name) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: فرع القاهرة الرئيسي"
            dir="rtl"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-ar"
          />
        </div>

        {/* Address & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Downtown Cairo"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +20220001111"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Active Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-semibold text-slate-800">Operational & Active</span>
          </label>
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
            <span>{locationToEdit ? 'Save Changes' : 'Create Location'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
