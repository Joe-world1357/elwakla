export type UserRole =
  | 'ROLE_ADMIN'
  | 'ROLE_OWNER'
  | 'ROLE_BRANCH_MGR'
  | 'ROLE_WH_KEEPER'
  | 'ROLE_CASHIER'
  | 'ROLE_PURCHASER'
  | 'ROLE_AUDITOR'
  | 'ROLE_CUSTOMER'
  | 'ROLE_CRAFTSMAN';

export interface User {
  id: string; // e.g. "USR-001"
  username: string;
  fullName?: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  username: string;
  fullName?: string;
  role: UserRole;
  loggedInAt: string;
}

export type LocationType = 'RETAIL_BRANCH' | 'DISTRIBUTION_HUB' | 'SPECIALIZED_WAREHOUSE';

export interface Location {
  id: string; // e.g. "LOC-001"
  code: string; // e.g. "BR-CAIRO-01"
  nameAr: string;
  nameEn: string;
  type: LocationType;
  address: string;
  phone: string;
  isActive: boolean;
}

export type ProductCategory = 'Electrical' | 'Plumbing' | 'Hardware' | 'Paints' | 'Tools';

export interface TechnicalAttributes {
  // Electrical
  voltage?: string;
  gauge?: string;
  color?: string;
  // Plumbing
  diameter?: string;
  pressureRating?: string;
  material?: string;
  // Paints
  baseType?: string;
  finish?: string;
  volume?: string;
  // Hardware / Tools
  dimensions?: string;
  grade?: string;
  powerSource?: string;
  wattage?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string; // e.g. "PRD-001"
  sku: string; // e.g. "ELC-CBL-4MM"
  primaryBarcode: string; // e.g. "6291000123456"
  nameAr: string;
  nameEn: string;
  category: ProductCategory;
  unitOfMeasure: string;
  minReorderLevel: number;
  avgCostPrice: number;
  defaultWholesalePrice: number;
  defaultRetailPrice: number;
  technicalAttributes: TechnicalAttributes;
}

export interface BranchInventory {
  id: string; // e.g. "INV-001"
  branchId: string;
  productId: string;
  onHand: number;
  reserved: number;
  available: number;
}

export interface BranchPriceOverride {
  id: string; // e.g. "PRC-001"
  branchId: string;
  productId: string;
  overrideRetailPrice?: number;
  overrideWholesalePrice?: number;
}

export interface EffectivePrice {
  retail: number;
  wholesale: number;
  isRetailOverridden: boolean;
  isWholesaleOverridden: boolean;
  overrideRecord?: BranchPriceOverride;
}
