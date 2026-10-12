import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { db } from '../../services/db';
import { UserModal } from './UserModal';
import { Plus, Search, Edit3, Shield, CheckCircle2, XCircle, Phone, Mail } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  onRefresh: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
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

  const handleSaveUser = (userData: {
    username: string;
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
      {/* Top Header & Action */}
      <div className="sm:flex sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            User Management & RBAC Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage enterprise operators, warehouse keepers, branch managers, and customer roles
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Role Filter:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ROLE_ADMIN">ROLE_ADMIN</option>
            <option value="ROLE_OWNER">ROLE_OWNER</option>
            <option value="ROLE_BRANCH_MGR">ROLE_BRANCH_MGR</option>
            <option value="ROLE_WH_KEEPER">ROLE_WH_KEEPER</option>
            <option value="ROLE_CASHIER">ROLE_CASHIER</option>
            <option value="ROLE_PURCHASER">ROLE_PURCHASER</option>
            <option value="ROLE_AUDITOR">ROLE_AUDITOR</option>
            <option value="ROLE_CUSTOMER">ROLE_CUSTOMER</option>
            <option value="ROLE_CRAFTSMAN">ROLE_CRAFTSMAN</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold text-slate-700 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-slate-700 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-slate-700 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-slate-700 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Username */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.username}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.id}</div>
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
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {user.role}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge (SRS Specification: bg-emerald-100 text-emerald-800 for active) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Actions: Edit | Toggle */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
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
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
