import { UserRole } from '../types';

export interface UserPermissions {
  canViewOverview: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean; // Add, edit, activate/deactivate users
  canViewLocations: boolean;
  canManageLocations: boolean; // Add, edit, disable locations
  canViewInventory: boolean;
  canAdjustInventory: boolean; // Adjust on-hand and reserved stock
  canViewCatalog: boolean;
  canManageCatalog: boolean; // Add, edit, delete catalog products
  canViewCostPrice: boolean; // Confidential supplier cost visibility
  canSetPriceOverrides: boolean; // Configure branch-specific pricing overrides
  canResetDatabase: boolean; // Factory reset database
}

export const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'ROLE_ADMIN':
    case 'ROLE_OWNER':
      return {
        canViewOverview: true,
        canViewUsers: true,
        canManageUsers: true,
        canViewLocations: true,
        canManageLocations: true,
        canViewInventory: true,
        canAdjustInventory: true,
        canViewCatalog: true,
        canManageCatalog: true,
        canViewCostPrice: true,
        canSetPriceOverrides: true,
        canResetDatabase: true,
      };

    case 'ROLE_BRANCH_MGR':
      return {
        canViewOverview: true,
        canViewUsers: true, // Can review branch team
        canManageUsers: false, // User account creation reserved for Admin
        canViewLocations: true,
        canManageLocations: false,
        canViewInventory: true,
        canAdjustInventory: true,
        canViewCatalog: true,
        canManageCatalog: true, // Can introduce local items
        canViewCostPrice: true,
        canSetPriceOverrides: true, // Branch managers control localized prices
        canResetDatabase: false,
      };

    case 'ROLE_WH_KEEPER':
      return {
        canViewOverview: true,
        canViewUsers: false,
        canManageUsers: false,
        canViewLocations: true,
        canManageLocations: false,
        canViewInventory: true,
        canAdjustInventory: true, // Stock keepers record physical inventory counts
        canViewCatalog: true,
        canManageCatalog: false,
        canViewCostPrice: false,
        canSetPriceOverrides: false,
        canResetDatabase: false,
      };

    case 'ROLE_PURCHASER':
      return {
        canViewOverview: true,
        canViewUsers: false,
        canManageUsers: false,
        canViewLocations: true,
        canManageLocations: false,
        canViewInventory: true,
        canAdjustInventory: true, // Receiving goods into stock
        canViewCatalog: true,
        canManageCatalog: true, // Product catalog management
        canViewCostPrice: true, // Cost oversight
        canSetPriceOverrides: false,
        canResetDatabase: false,
      };

    case 'ROLE_AUDITOR':
      return {
        canViewOverview: true,
        canViewUsers: true, // Compliance audit
        canManageUsers: false,
        canViewLocations: true,
        canManageLocations: false,
        canViewInventory: true,
        canAdjustInventory: false, // Auditors are strictly read-only
        canViewCatalog: true,
        canManageCatalog: false,
        canViewCostPrice: true, // Financial verification
        canSetPriceOverrides: false,
        canResetDatabase: false,
      };

    case 'ROLE_CASHIER':
      return {
        canViewOverview: true,
        canViewUsers: false,
        canManageUsers: false,
        canViewLocations: true,
        canManageLocations: false,
        canViewInventory: true, // Check availability for retail customers
        canAdjustInventory: false,
        canViewCatalog: true,
        canManageCatalog: false,
        canViewCostPrice: false, // Frontline cashiers see retail/wholesale, not cost
        canSetPriceOverrides: false,
        canResetDatabase: false,
      };

    case 'ROLE_CUSTOMER':
    case 'ROLE_CRAFTSMAN':
    default:
      return {
        canViewOverview: true,
        canViewUsers: false,
        canManageUsers: false,
        canViewLocations: true, // View branch contact & addresses
        canManageLocations: false,
        canViewInventory: true, // View stock availability
        canAdjustInventory: false,
        canViewCatalog: true, // Browse catalog
        canManageCatalog: false,
        canViewCostPrice: false,
        canSetPriceOverrides: false,
        canResetDatabase: false,
      };
  }
};

export const getRoleDisplayName = (role: UserRole): { nameEn: string; nameAr: string } => {
  switch (role) {
    case 'ROLE_ADMIN':
      return { nameEn: 'System Administrator', nameAr: 'مدير النظام' };
    case 'ROLE_OWNER':
      return { nameEn: 'Enterprise Owner', nameAr: 'مالك المنصة' };
    case 'ROLE_BRANCH_MGR':
      return { nameEn: 'Branch Manager', nameAr: 'مدير الفرع' };
    case 'ROLE_WH_KEEPER':
      return { nameEn: 'Warehouse Keeper', nameAr: 'أمين المستودع' };
    case 'ROLE_PURCHASER':
      return { nameEn: 'Purchasing Specialist', nameAr: 'مسؤول المشتريات' };
    case 'ROLE_AUDITOR':
      return { nameEn: 'Inventory Auditor', nameAr: 'مراجع المخزون' };
    case 'ROLE_CASHIER':
      return { nameEn: 'POS Cashier', nameAr: 'كاشير نقطة البيع' };
    case 'ROLE_CUSTOMER':
      return { nameEn: 'Commercial Customer', nameAr: 'عميل تجاري' };
    case 'ROLE_CRAFTSMAN':
      return { nameEn: 'Craftsman / Tradesman', nameAr: 'فني وحرفي' };
    default:
      return { nameEn: role, nameAr: role };
  }
};
