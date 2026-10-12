import React, { useState } from 'react';
import { Session, Location, Product, LocationType } from '../../types';
import { db } from '../../services/db';
import { LocationModal } from './LocationModal';
import { BranchInventoryDrawer } from './BranchInventoryDrawer';
import { UserPermissions } from '../../services/auth';
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
  Check,
  Package,
  Lock,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface LocationsViewProps {
  locations: Location[];
  products: Product[];
  session: Session;
  permissions: UserPermissions;
  activeBranchId: string;
  onSelectActiveBranch: (id: string) => void;
  onRefresh: () => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  products,
  session,
  permissions,
  activeBranchId,
  onSelectActiveBranch,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocationForEdit, setSelectedLocationForEdit] = useState<Location | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocationForDrawer, setSelectedLocationForDrawer] = useState<Location | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Location | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!permissions.canViewLocations) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">IAM Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your current role (<span className="font-mono font-semibold text-slate-700">{session.role}</span>) does not have permission to view branch configurations.
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setSelectedLocationForEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setSelectedLocationForEdit(loc);
    setModalOpen(true);
  };

  const handleToggleStatus = (loc: Location) => {
    db.toggleLocationStatus(loc.id);
    onRefresh();
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    setDeleteError(null);
    const res = db.deleteLocation(deleteCandidate.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete location.');
      return;
    }
    setDeleteCandidate(null);
    onRefresh();
  };

  const handleOpenDrawer = (loc: Location) => {
    setSelectedLocationForDrawer(loc);
    setDrawerOpen(true);
  };

  const handleSaveLocation = (locData: {
    code: string;
    nameAr: string;
    nameEn: string;
    type: LocationType;
    address: string;
    phone: string;
    isActive?: boolean;
  }) => {
    if (selectedLocationForEdit) {
      const res = db.updateLocation(selectedLocationForEdit.id, locData);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = db.createLocation(locData);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  const getLocationTypeBadge = (type: LocationType) => {
    switch (type) {
      case 'RETAIL_BRANCH':
        return {
          label: 'Retail Branch',
          icon: Building2,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'DISTRIBUTION_HUB':
        return {
          label: 'Distribution Hub',
          icon: Warehouse,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'SPECIALIZED_WAREHOUSE':
        return {
          label: 'Specialized Warehouse',
          icon: Boxes,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="sm:flex sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Branches & Warehouses Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Configure enterprise physical footprint, commercial stores, regional hubs, and isolated stock repositories
          </p>
        </div>
        {permissions.canManageLocations && (
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-3.5 py-2 text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State when zero locations exist */}
      {locations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Facilities Registered</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Zero demo branches exist in LocalStorage. Add your flagship retail branch or primary warehouse to track isolated inventories and localized pricing.
          </p>
          {permissions.canManageLocations && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2 text-xs shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Branch</span>
            </button>
          )}
        </div>
      ) : (
        /* Central Grid View (FR-LOC-04) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map((loc) => {
            const typeMeta = getLocationTypeBadge(loc.type);
            const Icon = typeMeta.icon;
            const isActiveContext = loc.id === activeBranchId;

            // Aggregated branch stock
            const branchInventory = db.getInventory(loc.id);
            const totalStock = branchInventory.reduce((acc, curr) => acc + curr.available, 0);
            const totalSkus = branchInventory.filter((inv) => inv.available > 0).length;

            return (
              <div
                key={loc.id}
                className={`bg-white rounded-xl border transition-all shadow-2xs flex flex-col justify-between overflow-hidden ${
                  isActiveContext
                    ? 'border-indigo-400 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                          {loc.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                          {loc.nameEn}
                        </h3>
                        <p className="text-xs text-slate-500 font-ar mt-0.5" dir="rtl">
                          {loc.nameAr}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {loc.isActive ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5 text-slate-400" />
                          <span>Disabled</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Classification Badge */}
                  <div className="mt-3">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${typeMeta.color}`}
                    >
                      {typeMeta.label}
                    </span>
                  </div>

                  {/* Location Meta (Address & Phone) */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{loc.address}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{loc.phone}</span>
                    </div>
                  </div>

                  {/* Stock KPI summary strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        SKUs in Stock
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-800">
                        {totalSkus}
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Available Units
                      </span>
                      <span className="text-sm font-bold font-mono text-indigo-700">
                        {totalStock.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2">
                  {/* View Branch Inventory Drawer button */}
                  {permissions.canViewInventory && (
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(loc)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/60 rounded-lg transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>View Branch Inventory Drawer</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    {/* Select as active context */}
                    <button
                      type="button"
                      onClick={() => onSelectActiveBranch(loc.id)}
                      className={`text-xs font-semibold inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                        isActiveContext
                          ? 'text-indigo-600 bg-indigo-50'
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

                    {permissions.canManageLocations && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(loc)}
                          className="text-xs text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-200/60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(loc)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60"
                        >
                          {loc.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(loc)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Delete location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Location Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => {
            setDeleteCandidate(null);
            setDeleteError(null);
          }}
          title={`Delete Location: ${deleteCandidate.nameEn}`}
          subtitle="Are you sure you want to permanently delete this branch/warehouse?"
          maxWidthClass="max-w-md"
        >
          <div className="space-y-4">
            {deleteError && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-700">
                {deleteError}
              </div>
            )}
            <p className="text-xs text-slate-600 leading-relaxed">
              Deleting <strong>{deleteCandidate.nameEn} ({deleteCandidate.code})</strong> will also remove its associated isolated inventory records and localized price overrides.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(null);
                  setDeleteError(null);
                }}
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
        permissions={permissions}
        onRefresh={onRefresh}
      />
    </div>
  );
};
