import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle, Check } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onSave: (userData: {
    username: string;
    fullName?: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    isActive?: boolean;
  }) => { success: boolean; error?: string };
}

const ALL_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'ROLE_ADMIN', label: 'Admin', desc: 'Full system privileges across all branches' },
  { role: 'ROLE_OWNER', label: 'Owner', desc: 'Enterprise business owner' },
  { role: 'ROLE_BRANCH_MGR', label: 'Branch Manager', desc: 'Directs branch operations and pricing' },
  { role: 'ROLE_WH_KEEPER', label: 'Warehouse Keeper', desc: 'Manages physical receipts and storage' },
  { role: 'ROLE_CASHIER', label: 'Cashier', desc: 'Point-of-sale transactions and registers' },
  { role: 'ROLE_PURCHASER', label: 'Purchaser', desc: 'Supplier procurement and cost oversight' },
  { role: 'ROLE_AUDITOR', label: 'Auditor', desc: 'Read-only compliance and inventory auditing' },
  { role: 'ROLE_CUSTOMER', label: 'Customer', desc: 'External commercial buyer account' },
  { role: 'ROLE_CRAFTSMAN', label: 'Craftsman (حرفي)', desc: 'Contractor and tradesman tier' },
];

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSave,
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_BRANCH_MGR');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setFullName(userToEdit.fullName || '');
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone);
      setPassword('');
      setRole(userToEdit.role);
      setIsActive(userToEdit.isActive);
    } else {
      setUsername('');
      setFullName('');
      setEmail('');
      setPhone('+201');
      setPassword('');
      setRole('ROLE_BRANCH_MGR');
      setIsActive(true);
    }
    setError(null);
  }, [userToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!userToEdit && !password.trim()) {
      setError('Password is required for new accounts.');
      return;
    }

    const res = onSave({
      username: username.trim(),
      fullName: fullName.trim() || undefined,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password.trim() ? password.trim() : undefined,
      role,
      isActive,
    });

    if (!res.success) {
      setError(res.error || 'Failed to save user.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? `Edit User: ${userToEdit.username}` : 'Add New User'}
      subtitle={
        userToEdit
          ? 'Update account details and role permissions'
          : 'Create a new operator account with specific RBAC role'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Full Name & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ahmed Hassan"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. cairo_mgr"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. user@alwakala.com"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +201000000005"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Password {userToEdit ? '(Leave blank to keep existing)' : <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={userToEdit ? '••••••••' : 'Enter account password'}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Role Assignment (FR-USER-03) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Role Assignment <span className="text-red-500">*</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            {ALL_ROLES.map((r) => (
              <option key={r.role} value={r.role}>
                {r.role} — {r.label} ({r.desc})
              </option>
            ))}
          </select>
        </div>

        {/* Status Toggle (FR-USER-04) */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800">Account Active</span>
              <p className="text-xs text-slate-500">
                Inactive accounts are barred from signing into the platform.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
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
            <span>{userToEdit ? 'Save Changes' : 'Create User'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
