import {
  User,
  Session,
  Location,
  Product,
  BranchInventory,
  BranchPriceOverride,
  EffectivePrice,
  UserRole,
} from '../types';

export const STORAGE_KEYS = {
  USERS: 'alwakala_users',
  SESSION: 'alwakala_session',
  LOCATIONS: 'alwakala_locations',
  PRODUCTS: 'alwakala_products',
  INVENTORY: 'alwakala_branch_inventory',
  PRICES: 'alwakala_branch_prices',
  VERSION: 'alwakala_db_version',
} as const;

const CURRENT_DB_VERSION = '3.0-zero-demo-data';

// Zero Demo Baseline: No mock accounts, no demo locations, no mock catalog
const DEFAULT_USERS: User[] = [];
const DEFAULT_LOCATIONS: Location[] = [];
const DEFAULT_PRODUCTS: Product[] = [];
const DEFAULT_INVENTORY: BranchInventory[] = [];
const DEFAULT_PRICES: BranchPriceOverride[] = [];

class AlWakalaDatabase {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('AlWakalaDB subscriber error:', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alwakala_db_change'));
    }
  }

  public ensureInitialized(): void {
    if (typeof window === 'undefined') return;

    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (storedVersion !== CURRENT_DB_VERSION) {
      // Purge all legacy demo data and re-initialize with clean slate
      this.resetToBaseline();
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_DB_VERSION);
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRICES)) {
      localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(DEFAULT_PRICES));
    }
  }

  public resetToBaseline(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(DEFAULT_PRICES));
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_DB_VERSION);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.notify();
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public findUserByUsernameOrEmail(identifier: string): User | undefined {
    const term = identifier.trim().toLowerCase();
    return this.getUsers().find(
      (u) => u.username.toLowerCase() === term || u.email.toLowerCase() === term
    );
  }

  public createUser(userData: {
    username: string;
    fullName?: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    isActive?: boolean;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanUsername = userData.username.trim();
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanPhone = userData.phone.trim();
    const cleanFullName = userData.fullName?.trim();

    // Enforce Uniqueness (FR-USER-02)
    if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, error: `Username "${cleanUsername}" is already taken.` };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `Email address "${cleanEmail}" is already registered.` };
    }
    if (users.some((u) => u.phone === cleanPhone)) {
      return { success: false, error: `Phone number "${cleanPhone}" is already associated with an account.` };
    }

    const maxIdNum = users.reduce((max, u) => {
      const match = u.id.match(/\d+/);
      return match ? Math.max(max, parseInt(match[0], 10)) : max;
    }, 0);
    const newId = `USR-${String(maxIdNum + 1).padStart(3, '0')}`;

    const newUser: User = {
      id: newId,
      username: cleanUsername,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      password: userData.password || 'password123',
      role: userData.role,
      isActive: userData.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
    return { success: true, user: newUser };
  }

  public updateUser(
    id: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>
  ): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    const current = users[index];

    // Check unique conflicts if fields are changed
    if (updates.username && updates.username.toLowerCase() !== current.username.toLowerCase()) {
      if (users.some((u) => u.id !== id && u.username.toLowerCase() === updates.username!.toLowerCase())) {
        return { success: false, error: `Username "${updates.username}" is already in use.` };
      }
    }
    if (updates.email && updates.email.toLowerCase() !== current.email.toLowerCase()) {
      if (users.some((u) => u.id !== id && u.email.toLowerCase() === updates.email!.toLowerCase())) {
        return { success: false, error: `Email "${updates.email}" is already in use.` };
      }
    }
    if (updates.phone && updates.phone !== current.phone) {
      if (users.some((u) => u.id !== id && u.phone === updates.phone)) {
        return { success: false, error: `Phone "${updates.phone}" is already in use.` };
      }
    }

    const updatedUser: User = {
      ...current,
      ...updates,
      username: updates.username ? updates.username.trim() : current.username,
      email: updates.email ? updates.email.trim().toLowerCase() : current.email,
      phone: updates.phone ? updates.phone.trim() : current.phone,
    };

    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
    return { success: true, user: updatedUser };
  }

  public toggleUserStatus(id: string): { success: boolean; isActive?: boolean } {
    const user = this.getUserById(id);
    if (!user) return { success: false };
    const res = this.updateUser(id, { isActive: !user.isActive });
    return { success: res.success, isActive: res.user?.isActive };
  }

  public deleteUser(id: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, error: 'User not found in LocalStorage.' };

    const currentSession = this.getSession();
    if (currentSession && currentSession.userId === id) {
      return { success: false, error: 'Cannot delete the currently authenticated active session user.' };
    }

    if (target.role === 'ROLE_ADMIN') {
      const activeAdmins = users.filter((u) => u.role === 'ROLE_ADMIN');
      if (activeAdmins.length <= 1) {
        return { success: false, error: 'Cannot delete the only remaining System Administrator account.' };
      }
    }

    const filtered = users.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    this.notify();
    return { success: true };
  }

  // --- Session Management (FR-AUTH-01, 02, 03) ---
  public getSession(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public setSession(user: User): Session {
    const session: Session = {
      token: `mock-jwt-token-${user.id.toLowerCase()}-${Date.now()}`,
      userId: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      role: user.role,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    this.notify();
    return session;
  }

  public clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.notify();
  }

  // --- Locations & Branches (Feature 2) ---
  public getLocations(): Location[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getLocationById(id: string): Location | undefined {
    return this.getLocations().find((l) => l.id === id);
  }

  public createLocation(locationData: {
    code: string;
    nameAr: string;
    nameEn: string;
    type: Location['type'];
    address: string;
    phone: string;
    isActive?: boolean;
  }): { success: boolean; location?: Location; error?: string } {
    const locations = this.getLocations();
    const cleanCode = locationData.code.trim().toUpperCase();

    // Enforce Code Uniqueness (FR-LOC-03)
    if (locations.some((l) => l.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Location code "${cleanCode}" already exists. Please use a unique identifier.` };
    }

    const nextIndex = locations.length + 1;
    const newId = `LOC-${String(nextIndex).padStart(3, '0')}`;
    const newLocation: Location = {
      id: newId,
      code: cleanCode,
      nameAr: locationData.nameAr.trim(),
      nameEn: locationData.nameEn.trim(),
      type: locationData.type,
      address: locationData.address.trim(),
      phone: locationData.phone.trim(),
      isActive: locationData.isActive ?? true,
    };

    locations.push(newLocation);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.notify();
    return { success: true, location: newLocation };
  }

  public updateLocation(
    id: string,
    updates: Partial<Omit<Location, 'id'>>
  ): { success: boolean; error?: string; location?: Location } {
    const locations = this.getLocations();
    const index = locations.findIndex((l) => l.id === id);
    if (index === -1) {
      return { success: false, error: 'Location not found.' };
    }

    const current = locations[index];

    if (updates.code && updates.code.trim().toUpperCase() !== current.code.toUpperCase()) {
      const cleanCode = updates.code.trim().toUpperCase();
      if (locations.some((l) => l.id !== id && l.code.toUpperCase() === cleanCode)) {
        return { success: false, error: `Location code "${cleanCode}" is already in use by another branch.` };
      }
    }

    const updatedLocation: Location = {
      ...current,
      ...updates,
      code: updates.code ? updates.code.trim().toUpperCase() : current.code,
    };

    locations[index] = updatedLocation;
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.notify();
    return { success: true, location: updatedLocation };
  }

  public toggleLocationStatus(id: string): { success: boolean; isActive?: boolean } {
    const loc = this.getLocationById(id);
    if (!loc) return { success: false };
    const res = this.updateLocation(id, { isActive: !loc.isActive });
    return { success: res.success, isActive: res.location?.isActive };
  }

  public deleteLocation(id: string): { success: boolean; error?: string } {
    const locations = this.getLocations();
    const target = locations.find((l) => l.id === id);
    if (!target) return { success: false, error: 'Location not found.' };

    const filtered = locations.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(filtered));

    // Cascade: Clean up inventories and price overrides for deleted facility
    const allInvs = this.getInventory();
    const filteredInvs = allInvs.filter((inv) => inv.branchId !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(filteredInvs));

    const allPrices = this.getPriceOverrides();
    const filteredPrices = allPrices.filter((p) => p.branchId !== id);
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(filteredPrices));

    this.notify();
    return { success: true };
  }

  // --- Product Catalog & Categories (Feature 3) ---
  public getProducts(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public createProduct(productData: {
    sku: string;
    primaryBarcode: string;
    nameAr: string;
    nameEn: string;
    category: Product['category'];
    unitOfMeasure: string;
    minReorderLevel: number;
    avgCostPrice: number;
    defaultWholesalePrice: number;
    defaultRetailPrice: number;
    technicalAttributes?: Product['technicalAttributes'];
  }): { success: boolean; product?: Product; error?: string } {
    const products = this.getProducts();
    const cleanSku = productData.sku.trim().toUpperCase();
    const cleanBarcode = productData.primaryBarcode.trim();

    // Enforce SKU & Barcode Uniqueness (FR-PRD-02)
    if (products.some((p) => p.sku.toUpperCase() === cleanSku)) {
      return { success: false, error: `SKU "${cleanSku}" already exists in the catalog.` };
    }
    if (products.some((p) => p.primaryBarcode === cleanBarcode)) {
      return { success: false, error: `Primary Barcode "${cleanBarcode}" already exists in the catalog.` };
    }

    const nextIndex = products.length + 1;
    const newId = `PRD-${String(nextIndex).padStart(3, '0')}`;
    const newProduct: Product = {
      id: newId,
      sku: cleanSku,
      primaryBarcode: cleanBarcode,
      nameAr: productData.nameAr.trim(),
      nameEn: productData.nameEn.trim(),
      category: productData.category,
      unitOfMeasure: productData.unitOfMeasure.trim(),
      minReorderLevel: Math.max(0, Number(productData.minReorderLevel) || 0),
      avgCostPrice: Math.max(0, Number(productData.avgCostPrice) || 0),
      defaultWholesalePrice: Math.max(0, Number(productData.defaultWholesalePrice) || 0),
      defaultRetailPrice: Math.max(0, Number(productData.defaultRetailPrice) || 0),
      technicalAttributes: productData.technicalAttributes || {},
    };

    products.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
    return { success: true, product: newProduct };
  }

  public updateProduct(
    id: string,
    updates: Partial<Omit<Product, 'id'>>
  ): { success: boolean; error?: string; product?: Product } {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Product not found.' };
    }

    const current = products[index];

    if (updates.sku && updates.sku.trim().toUpperCase() !== current.sku.toUpperCase()) {
      const cleanSku = updates.sku.trim().toUpperCase();
      if (products.some((p) => p.id !== id && p.sku.toUpperCase() === cleanSku)) {
        return { success: false, error: `SKU "${cleanSku}" is already taken.` };
      }
    }

    if (updates.primaryBarcode && updates.primaryBarcode.trim() !== current.primaryBarcode) {
      const cleanBarcode = updates.primaryBarcode.trim();
      if (products.some((p) => p.id !== id && p.primaryBarcode === cleanBarcode)) {
        return { success: false, error: `Barcode "${cleanBarcode}" is already in use.` };
      }
    }

    const updatedProduct: Product = {
      ...current,
      ...updates,
      sku: updates.sku ? updates.sku.trim().toUpperCase() : current.sku,
      primaryBarcode: updates.primaryBarcode ? updates.primaryBarcode.trim() : current.primaryBarcode,
      minReorderLevel: updates.minReorderLevel !== undefined ? Number(updates.minReorderLevel) : current.minReorderLevel,
      avgCostPrice: updates.avgCostPrice !== undefined ? Number(updates.avgCostPrice) : current.avgCostPrice,
      defaultWholesalePrice:
        updates.defaultWholesalePrice !== undefined ? Number(updates.defaultWholesalePrice) : current.defaultWholesalePrice,
      defaultRetailPrice:
        updates.defaultRetailPrice !== undefined ? Number(updates.defaultRetailPrice) : current.defaultRetailPrice,
      technicalAttributes: updates.technicalAttributes
        ? { ...current.technicalAttributes, ...updates.technicalAttributes }
        : current.technicalAttributes,
    };

    products[index] = updatedProduct;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
    return { success: true, product: updatedProduct };
  }

  public deleteProduct(id: string): { success: boolean } {
    const products = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Cleanup associated inventory and price overrides
    const inventories = this.getInventory().filter((inv) => inv.productId !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventories));

    const prices = this.getPriceOverrides().filter((prc) => prc.productId !== id);
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));

    this.notify();
    return { success: true };
  }

  // --- Branch Inventory (FR-LOC-05, FR-LOC-06) ---
  public getInventory(branchId?: string): BranchInventory[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      const all: BranchInventory[] = raw ? JSON.parse(raw) : [];
      if (branchId) {
        return all.filter((inv) => inv.branchId === branchId);
      }
      return all;
    } catch {
      return [];
    }
  }

  public getProductBranchInventory(branchId: string, productId: string): BranchInventory | undefined {
    return this.getInventory(branchId).find((inv) => inv.productId === productId);
  }

  public setProductInventory(
    branchId: string,
    productId: string,
    onHand: number,
    reserved: number = 0
  ): BranchInventory {
    const inventories = this.getInventory();
    const existingIndex = inventories.findIndex(
      (inv) => inv.branchId === branchId && inv.productId === productId
    );

    const safeOnHand = Math.max(0, Math.floor(onHand));
    const safeReserved = Math.max(0, Math.min(safeOnHand, Math.floor(reserved)));
    const available = safeOnHand - safeReserved;

    if (existingIndex >= 0) {
      inventories[existingIndex] = {
        ...inventories[existingIndex],
        onHand: safeOnHand,
        reserved: safeReserved,
        available,
      };
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventories));
      this.notify();
      return inventories[existingIndex];
    } else {
      const newInventory: BranchInventory = {
        id: `INV-${String(inventories.length + 1).padStart(3, '0')}`,
        branchId,
        productId,
        onHand: safeOnHand,
        reserved: safeReserved,
        available,
      };
      inventories.push(newInventory);
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventories));
      this.notify();
      return newInventory;
    }
  }

  // Aggregate stock across all branches
  public getTotalAvailableStock(productId: string): number {
    const inventories = this.getInventory().filter((inv) => inv.productId === productId);
    return inventories.reduce((sum, inv) => sum + inv.available, 0);
  }

  // --- Branch Price Overrides (FR-PRD-06, FR-PRD-07) ---
  public getPriceOverrides(branchId?: string): BranchPriceOverride[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRICES);
      const all: BranchPriceOverride[] = raw ? JSON.parse(raw) : [];
      if (branchId) {
        return all.filter((p) => p.branchId === branchId);
      }
      return all;
    } catch {
      return [];
    }
  }

  public getProductPriceOverride(branchId: string, productId: string): BranchPriceOverride | undefined {
    return this.getPriceOverrides(branchId).find((p) => p.productId === productId);
  }

  public setPriceOverride(
    branchId: string,
    productId: string,
    overrideRetailPrice?: number,
    overrideWholesalePrice?: number
  ): BranchPriceOverride {
    const overrides = this.getPriceOverrides();
    const existingIndex = overrides.findIndex(
      (p) => p.branchId === branchId && p.productId === productId
    );

    const cleanRetail =
      overrideRetailPrice !== undefined && overrideRetailPrice > 0 ? Number(overrideRetailPrice) : undefined;
    const cleanWholesale =
      overrideWholesalePrice !== undefined && overrideWholesalePrice > 0 ? Number(overrideWholesalePrice) : undefined;

    if (existingIndex >= 0) {
      overrides[existingIndex] = {
        ...overrides[existingIndex],
        overrideRetailPrice: cleanRetail,
        overrideWholesalePrice: cleanWholesale,
      };
      localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(overrides));
      this.notify();
      return overrides[existingIndex];
    } else {
      const newOverride: BranchPriceOverride = {
        id: `PRC-${String(overrides.length + 1).padStart(3, '0')}`,
        branchId,
        productId,
        overrideRetailPrice: cleanRetail,
        overrideWholesalePrice: cleanWholesale,
      };
      overrides.push(newOverride);
      localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(overrides));
      this.notify();
      return newOverride;
    }
  }

  public deletePriceOverride(branchId: string, productId: string): boolean {
    const overrides = this.getPriceOverrides().filter(
      (p) => !(p.branchId === branchId && p.productId === productId)
    );
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(overrides));
    this.notify();
    return true;
  }

  /**
   * Price Fallback Engine (FR-PRD-07):
   * Evaluates branch price overrides first; if no override exists, displays default catalog retail/wholesale prices.
   */
  public getEffectivePrice(productId: string, branchId?: string): EffectivePrice {
    const product = this.getProductById(productId);
    if (!product) {
      return {
        retail: 0,
        wholesale: 0,
        isRetailOverridden: false,
        isWholesaleOverridden: false,
      };
    }

    if (!branchId) {
      return {
        retail: product.defaultRetailPrice,
        wholesale: product.defaultWholesalePrice,
        isRetailOverridden: false,
        isWholesaleOverridden: false,
      };
    }

    const override = this.getProductPriceOverride(branchId, productId);
    const hasRetailOverride =
      override?.overrideRetailPrice !== undefined && override.overrideRetailPrice !== null && override.overrideRetailPrice > 0;
    const hasWholesaleOverride =
      override?.overrideWholesalePrice !== undefined &&
      override.overrideWholesalePrice !== null &&
      override.overrideWholesalePrice > 0;

    return {
      retail: hasRetailOverride ? (override.overrideRetailPrice as number) : product.defaultRetailPrice,
      wholesale: hasWholesaleOverride ? (override.overrideWholesalePrice as number) : product.defaultWholesalePrice,
      isRetailOverridden: hasRetailOverride,
      isWholesaleOverridden: hasWholesaleOverride,
      overrideRecord: override,
    };
  }
}

export const db = new AlWakalaDatabase();
