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
} as const;

// Default Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    email: 'admin@alwakala.com',
    phone: '+201000000001',
    password: 'password123',
    role: 'ROLE_ADMIN',
    isActive: true,
    createdAt: '2026-10-12T00:00:00.000Z',
  },
  {
    id: 'USR-002',
    username: 'cairo_mgr',
    email: 'mgr.cairo@alwakala.com',
    phone: '+201000000002',
    password: 'password123',
    role: 'ROLE_BRANCH_MGR',
    isActive: true,
    createdAt: '2026-10-12T01:00:00.000Z',
  },
  {
    id: 'USR-003',
    username: 'cashier1',
    email: 'c1@alwakala.com',
    phone: '+201000000003',
    password: 'password123',
    role: 'ROLE_CASHIER',
    isActive: true,
    createdAt: '2026-10-12T02:00:00.000Z',
  },
  {
    id: 'USR-004',
    username: 'keeper_alex',
    email: 'wh.alex@alwakala.com',
    phone: '+201000000004',
    password: 'password123',
    role: 'ROLE_WH_KEEPER',
    isActive: true,
    createdAt: '2026-10-12T03:00:00.000Z',
  },
  {
    id: 'USR-005',
    username: 'tariq_auditor',
    email: 'tariq@alwakala.com',
    phone: '+201000000005',
    password: 'password123',
    role: 'ROLE_AUDITOR',
    isActive: false,
    createdAt: '2026-10-12T04:00:00.000Z',
  },
];

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'LOC-001',
    code: 'BR-CAIRO-01',
    nameAr: 'فرع القاهرة الرئيسي',
    nameEn: 'Cairo Flagship Branch',
    type: 'RETAIL_BRANCH',
    address: 'Downtown Cairo, Tahrir Square, Bldg 14',
    phone: '+20220001111',
    isActive: true,
  },
  {
    id: 'LOC-002',
    code: 'WH-MAIN-01',
    nameAr: 'مركز التوزيع الرئيسي - العاشر من رمضان',
    nameEn: '10th of Ramadan Distribution Hub',
    type: 'DISTRIBUTION_HUB',
    address: 'Industrial Zone 3, 10th of Ramadan City',
    phone: '+20153300222',
    isActive: true,
  },
  {
    id: 'LOC-003',
    code: 'BR-ALEX-01',
    nameAr: 'فرع الإسكندرية البحري',
    nameEn: 'Alexandria Coastal Branch',
    type: 'RETAIL_BRANCH',
    address: 'Corniche El-Nile, Smouha, Alexandria',
    phone: '+20349003333',
    isActive: true,
  },
  {
    id: 'LOC-004',
    code: 'WH-METALS-02',
    nameAr: 'مستودع الكيماويات والدهانات المتخصص',
    nameEn: 'Specialized Chemical & Paint Depot',
    type: 'SPECIALIZED_WAREHOUSE',
    address: 'Borg El-Arab Logistics Center',
    phone: '+20345004444',
    isActive: true,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'PRD-001',
    sku: 'ELC-CBL-4MM',
    primaryBarcode: '6291000123456',
    nameAr: 'كابل كهرباء نحاس 4 مم معزول',
    nameEn: 'Electrical Cable 4mm Copper Insulated',
    category: 'Electrical',
    unitOfMeasure: 'Meter',
    minReorderLevel: 50,
    avgCostPrice: 25.0,
    defaultWholesalePrice: 35.0,
    defaultRetailPrice: 45.0,
    technicalAttributes: {
      voltage: '220V',
      gauge: '4mm',
      color: 'Red',
    },
  },
  {
    id: 'PRD-002',
    sku: 'ELC-BRK-32A',
    primaryBarcode: '6291000123463',
    nameAr: 'قاطع تيار كهربائي أوتوماتيك 32 أمبير',
    nameEn: 'Circuit Breaker Miniature 32A',
    category: 'Electrical',
    unitOfMeasure: 'Piece',
    minReorderLevel: 20,
    avgCostPrice: 85.0,
    defaultWholesalePrice: 110.0,
    defaultRetailPrice: 135.0,
    technicalAttributes: {
      voltage: '380V',
      gauge: '32 Ampere',
      color: 'White/Grey',
    },
  },
  {
    id: 'PRD-003',
    sku: 'PLM-PPR-32MM',
    primaryBarcode: '6291000123470',
    nameAr: 'ماسورة بولي بروبيلين PPR 32 مم 4 متر',
    nameEn: 'PPR High Pressure Pipe 32mm (4m)',
    category: 'Plumbing',
    unitOfMeasure: 'Piece',
    minReorderLevel: 40,
    avgCostPrice: 42.0,
    defaultWholesalePrice: 56.0,
    defaultRetailPrice: 70.0,
    technicalAttributes: {
      diameter: '32mm (1 inch)',
      pressureRating: 'PN20 / 20 Bar',
      material: 'PPR Pure Random Copolymer',
    },
  },
  {
    id: 'PRD-004',
    sku: 'PNT-EML-GLOSS',
    primaryBarcode: '6291000123487',
    nameAr: 'دهان زيتي لامع أبيض فائق النقاء',
    nameEn: 'High-Gloss Acrylic Enamel Pure White',
    category: 'Paints',
    unitOfMeasure: 'Can',
    minReorderLevel: 15,
    avgCostPrice: 140.0,
    defaultWholesalePrice: 175.0,
    defaultRetailPrice: 215.0,
    technicalAttributes: {
      baseType: 'Oil-Based Alkyd',
      finish: 'High Gloss Super Reflective',
      volume: '3.75 Liters (1 Gallon)',
    },
  },
  {
    id: 'PRD-005',
    sku: 'HDW-BLT-M10',
    primaryBarcode: '6291000123494',
    nameAr: 'طقم مسامير صلب مجلفن سداسي M10×50',
    nameEn: 'Hex Head Galvanized Bolt Set M10x50',
    category: 'Hardware',
    unitOfMeasure: 'Box',
    minReorderLevel: 30,
    avgCostPrice: 60.0,
    defaultWholesalePrice: 78.0,
    defaultRetailPrice: 95.0,
    technicalAttributes: {
      dimensions: 'M10 x 50mm Thread',
      grade: 'Grade 8.8 High Tensile Steel',
    },
  },
  {
    id: 'PRD-006',
    sku: 'TLS-DRL-850W',
    primaryBarcode: '6291000123500',
    nameAr: 'شنيور دقاق احترافي 850 واط سرعتين',
    nameEn: 'Impact Hammer Drill 850W Heavy Duty',
    category: 'Tools',
    unitOfMeasure: 'Piece',
    minReorderLevel: 8,
    avgCostPrice: 520.0,
    defaultWholesalePrice: 640.0,
    defaultRetailPrice: 750.0,
    technicalAttributes: {
      powerSource: 'Corded AC 220-240V',
      wattage: '850 Watts Max Peak',
      dimensions: 'Keyless Chuck 13mm',
    },
  },
];

const DEFAULT_INVENTORY: BranchInventory[] = [
  // Cairo Flagship (LOC-001)
  {
    id: 'INV-001',
    branchId: 'LOC-001',
    productId: 'PRD-001',
    onHand: 120,
    reserved: 10,
    available: 110,
  },
  {
    id: 'INV-002',
    branchId: 'LOC-001',
    productId: 'PRD-002',
    onHand: 45,
    reserved: 5,
    available: 40,
  },
  {
    id: 'INV-003',
    branchId: 'LOC-001',
    productId: 'PRD-003',
    onHand: 18, // Below minReorderLevel (40) -> Low stock warning!
    reserved: 2,
    available: 16,
  },
  {
    id: 'INV-004',
    branchId: 'LOC-001',
    productId: 'PRD-004',
    onHand: 28,
    reserved: 0,
    available: 28,
  },
  {
    id: 'INV-005',
    branchId: 'LOC-001',
    productId: 'PRD-005',
    onHand: 65,
    reserved: 5,
    available: 60,
  },
  {
    id: 'INV-006',
    branchId: 'LOC-001',
    productId: 'PRD-006',
    onHand: 4, // Below minReorderLevel (8) -> Low stock warning!
    reserved: 1,
    available: 3,
  },

  // Central Hub (LOC-002) - Bulk stocks
  {
    id: 'INV-007',
    branchId: 'LOC-002',
    productId: 'PRD-001',
    onHand: 2500,
    reserved: 200,
    available: 2300,
  },
  {
    id: 'INV-008',
    branchId: 'LOC-002',
    productId: 'PRD-002',
    onHand: 450,
    reserved: 30,
    available: 420,
  },
  {
    id: 'INV-009',
    branchId: 'LOC-002',
    productId: 'PRD-003',
    onHand: 800,
    reserved: 50,
    available: 750,
  },
  {
    id: 'INV-010',
    branchId: 'LOC-002',
    productId: 'PRD-004',
    onHand: 200,
    reserved: 10,
    available: 190,
  },

  // Alexandria Coastal (LOC-003)
  {
    id: 'INV-011',
    branchId: 'LOC-003',
    productId: 'PRD-001',
    onHand: 35, // Low stock!
    reserved: 0,
    available: 35,
  },
  {
    id: 'INV-012',
    branchId: 'LOC-003',
    productId: 'PRD-004',
    onHand: 12, // Low stock!
    reserved: 2,
    available: 10,
  },
];

const DEFAULT_PRICES: BranchPriceOverride[] = [
  {
    id: 'PRC-001',
    branchId: 'LOC-001',
    productId: 'PRD-001',
    overrideRetailPrice: 48.0,
    overrideWholesalePrice: 37.0,
  },
  {
    id: 'PRC-002',
    branchId: 'LOC-001',
    productId: 'PRD-006',
    overrideRetailPrice: 775.0,
    overrideWholesalePrice: 660.0,
  },
  {
    id: 'PRC-003',
    branchId: 'LOC-003',
    productId: 'PRD-004',
    overrideRetailPrice: 225.0,
    overrideWholesalePrice: 185.0,
  },
];

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

    // Ensure session key exists or is null (clean start on authentication screen)
  }

  public resetToBaseline(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(DEFAULT_PRICES));
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
