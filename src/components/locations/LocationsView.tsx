import React, { useState } from 'react';
import { Location, Product, LocationType } from '../../types';
import { db } from '../../services/db';
import { LocationModal } from './LocationModal';
import { BranchInventoryDrawer } from './BranchInventoryDrawer';
import {
  Plus,
  Building2,
  Warehouse,
  Boxes,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Edit3,
  ExternalLink,
  Check,
  Package,
} from 'lucide-react';

interface LocationsViewProps {
  locations: Location[];
  products: Product[];
  activeBranchId: string;
  onSelectActiveBranch: (id: string) => void;
  onRefresh: () => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  products,
  activeBranchId,
  onSelectActiveBranch,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocationForEdit, setSelectedLocationForEdit] = useState<Location | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocationForDrawer, setSelectedLocationForDrawer] = useState<Location | null>(null);

  const handleOpenAdd = () => {
    setSelectedLocationForEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setSelectedLocationForEdit(loc);
    setModalOpen(true);
  };

  const handleOpenDrawer = (loc: Location) => {
    setSelectedLocationForDrawer(loc);
    setDrawerOpen(true);
  };

  const handleToggleStatus = (loc: Location) => {
    db.toggleLocationStatus(loc.id);
    onRefresh();
  };

  const handleSaveLocation = (data: {
    code: string;
    nameAr: string;
    nameEn: string;
    type: LocationType;
    address: string;
    phone: string;
    isActive?: boolean;
  }) => {
    if (selectedLocationForEdit) {
      const res = db.updateLocation(selectedLocationForEdit.id, data);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = db.createLocation(data);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'DISTRIBUTION_HUB':
        return <Warehouse className="w-5 h-5 text-indigo-600" />;
      case 'SPECIALIZED_WAREHOUSE':
        return <Boxes className="w-5 h-5 text-amber-600" />;
      case 'RETAIL_BRANCH':
      default:
        return <Building2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="sm:flex sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Branches & Warehouses Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Physical retail stores, regional distribution hubs, and specialized stock depots
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Central Grid View (FR-LOC-04) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => {
          const isActiveContext = loc.id === activeBranchId;
          const branchInventory = db.getInventory(loc.id);
          const totalUnits = branchInventory.reduce((acc, curr) => acc + curr.available, 0);
          const uniqueItems = branchInventory.length;

          return (
            <div
              key={loc.id}
              className={`bg-white rounded-xl border transition-all duration-200 shadow-2xs flex flex-col justify-between overflow-hidden ${
                isActiveContext
                  ? 'border-indigo-400 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      {getLocationIcon(loc.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {loc.nameEn}
                      </h3>
                      <p className="text-xs text-slate-500 font-ar mt-0.5" dir="rtl">
                        {loc.nameAr}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge (SRS Specification: bg-emerald-100 text-emerald-800 for active) */}
                  <div>
                    {loc.isActive ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 shrink-0">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata & Identification */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Code:</span>
                    <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {loc.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Type:</span>
                    <span className="font-medium text-slate-700">
                      {loc.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-slate-600 gap-2">
                    <span className="text-slate-400 shrink-0">Address:</span>
                    <span className="text-slate-800 text-right truncate">
                      {loc.address}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Contact:</span>
                    <span className="font-mono text-slate-800 text-[11px]">
                      {loc.phone}
                    </span>
                  </div>

                  {/* Stock Summary Pill */}
                  <div className="pt-1 flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Stock Count:</span>
                    <span className="text-slate-900 font-semibold font-mono tabular-nums">
                      {totalUnits} units ({uniqueItems} SKUs)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2">
                {/* View Branch Inventory Drawer button (FR-LOC-05) */}
                <button
                  type="button"
                  onClick={() => handleOpenDrawer(loc)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/60 rounded-lg transition-colors"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>View Branch Inventory Drawer</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  {/* Select as active context */}
                  <button
                    type="button"
                    onClick={() => onSelectActiveBranch(loc.id)}
                    className={`text-xs font-medium inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      isActiveContext
                        ? 'text-indigo-600 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {isActiveContext ? (
                      <>
                        <Check className="w-3 h-3 text-indigo-600" />
                        <span>Active Context</span>
                      </>
                    ) : (
                      <span>Set as Active</span>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(loc)}
                      className="text-xs text-slate-600 hover:text-indigo-600 px-1.5 py-1 rounded hover:bg-slate-200/50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(loc)}
                      className="text-xs text-slate-500 hover:text-slate-800 px-1.5 py-1 rounded hover:bg-slate-200/50"
                    >
                      {loc.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        locationToEdit={selectedLocationForEdit}
        onSave={handleSaveLocation}
      />

      {/* Branch Inventory Drawer */}
      <BranchInventoryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        location={selectedLocationForDrawer}
        products={products}
        onRefresh={onRefresh}
      />
    </div>
  );
};
