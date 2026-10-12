import React, { useState } from 'react';
import { Session, User, UserRole } from '../../types';
import { db } from '../../services/db';
import { UserModal } from './UserModal';
import { UserPermissions, getRolePermissions, getRoleDisplayName } from '../../services/auth';
import {
  Plus,
  Search,
  Edit3,
  Shield,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Lock,
  Trash2,
  ShieldAlert,
  Info,
  Check,
  X,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface UsersViewProps {
  users: User[];
  session: Session;
  permissions: UserPermissions;
  onRefresh: () => void;
}

const ALL_ROLES: UserRole[] = [
  'ROLE_ADMIN',
  'ROLE_OWNER',
  'ROLE_BRANCH_MGR',
  'ROLE_WH_KEEPER',
  'ROLE_PURCHASER',
  'ROLE_AUDITOR',
  'ROLE_CASHIER',
  'ROLE_CUSTOMER',
  'ROLE_CRAFTSMAN',
];

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  session,
  permissions,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  if (!permissions.canViewUsers) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">IAM Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your current role (<span className="font-mono font-semibold text-slate-700">{session.role}</span>) does not have permission to inspect or manage user directories.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    db.toggleUserStatus(user.id);
    onRefresh();
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    setDeleteError(null);
    const res = db.deleteUser(deleteCandidate.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete user.');
      return;
    }
    setDeleteCandidate(null);
    onRefresh();
  };

  const handleSaveUser = (userData: {
    username: string;
    fullName?: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    isActive?: boolean;
  }) => {
    if (selectedUser) {
      const res = db.updateUser(selectedUser.id, userData);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = db.createUser(userData);
      if (res.success) {
        onRefresh();
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  const formatRoleDisplay = (role: string) => {
    return role.replace('ROLE_', '');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="sm:flex sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            User Management & RBAC Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enforcing identity, credentials, and role-based permissions across enterprise users
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          {/* IAM Role Permissions Matrix Button */}
          <button
            type="button"
            onClick={() => setShowMatrixModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg px-3 py-2 text-xs transition-colors border border-slate-200"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            <span>IAM Matrix</span>
          </button>

          {permissions.canManageUsers && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-3.5 py-2 text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search username, name, email or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0 mr-1">
            Filter:
          </span>
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Roles ({users.length})
          </button>
          {ALL_ROLES.map((r) => {
            const count = users.filter((u) => u.role === r).length;
            if (count === 0 && roleFilter !== r) return null;
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {formatRoleDisplay(r)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">User Profile</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">IAM Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-slate-700">No users found</p>
                      <p className="text-xs text-slate-400">
                        {users.length === 0
                          ? 'Zero users registered in LocalStorage. Click "+ Add User" above to add an operator.'
                          : 'Try adjusting your search query or role filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Profile */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>@{user.username}</span>
                            {user.id === session.userId && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {user.fullName || 'No display name'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {user.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {getRoleDisplayName(user.role).nameEn}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {permissions.canManageUsers ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={user.id === session.userId}
                            onClick={() => handleToggleStatus(user)}
                            title={
                              user.id === session.userId
                                ? 'Cannot deactivate currently active session account'
                                : undefined
                            }
                            className={`px-2 py-1 rounded-md font-medium transition-colors text-[11px] disabled:opacity-40 disabled:cursor-not-allowed ${
                              user.isActive
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            disabled={user.id === session.userId}
                            onClick={() => setDeleteCandidate(user)}
                            title={
                              user.id === session.userId
                                ? 'Cannot delete current session'
                                : 'Delete user account'
                            }
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          Read-Only
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => {
            setDeleteCandidate(null);
            setDeleteError(null);
          }}
          title={`Delete User: @${deleteCandidate.username}`}
          subtitle="Are you sure you want to permanently delete this account from LocalStorage?"
          maxWidthClass="max-w-md"
        >
          <div className="space-y-4">
            {deleteError && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-700">
                {deleteError}
              </div>
            )}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1 text-xs">
              <p><strong>Username:</strong> @{deleteCandidate.username}</p>
              <p><strong>Role:</strong> {deleteCandidate.role}</p>
              <p><strong>Email:</strong> {deleteCandidate.email}</p>
            </div>
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

      {/* IAM Permissions Matrix Modal */}
      {showMatrixModal && (
        <Modal
          isOpen={showMatrixModal}
          onClose={() => setShowMatrixModal(false)}
          title="IAM Role Permissions & Authorization Matrix"
          subtitle="Enterprise access control specification across all 9 roles"
          maxWidthClass="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full text-[11px] divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-bold">
                  <tr>
                    <th className="px-3 py-2 text-left">Role Identifier</th>
                    <th className="px-2 py-2 text-center">Manage Users</th>
                    <th className="px-2 py-2 text-center">Manage Locations</th>
                    <th className="px-2 py-2 text-center">Manage Catalog</th>
                    <th className="px-2 py-2 text-center">View Cost Price</th>
                    <th className="px-2 py-2 text-center">Adjust Stock</th>
                    <th className="px-2 py-2 text-center">Price Overrides</th>
                    <th className="px-2 py-2 text-center">Reset DB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {ALL_ROLES.map((r) => {
                    const p = getRolePermissions(r);
                    const isCurrent = r === session.role;
                    return (
                      <tr key={r} className={isCurrent ? 'bg-indigo-50/50 font-semibold' : ''}>
                        <td className="px-3 py-2 text-left font-mono">
                          <div className="flex items-center gap-1.5">
                            <span>{r}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-indigo-600 text-white px-1 py-0.2 rounded">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.canManageUsers ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <X className="w-3.5 h-3.5 text-slate-300 inline" />}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.canManageLocations ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <X className="w-3.5 h-3.5 text-slate-300 inline" />}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.canManageCatalog ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <X className="w-3.5 h-3.5 text-slate-300 inline" />}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.canViewCostPrice ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <X className="w-3.5 h-3.5 text-slate-300 inline" />}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.canAdjustInventory ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <X className="w-3.5 h-3.5 text-slate-300 inline" />}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.canSetPriceOverrides ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <X className="w-3.5 h-3.5 text-slate-300 inline" />}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {p.canResetDatabase ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <X className="w-3.5 h-3.5 text-slate-300 inline" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userToEdit={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};
