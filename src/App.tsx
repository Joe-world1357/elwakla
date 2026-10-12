import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import { Session, User, Location, Product } from './types';
import { Header } from './components/common/Header';
import { LoginView } from './components/auth/LoginView';
import { OverviewView } from './components/dashboard/OverviewView';
import { UsersView } from './components/users/UsersView';
import { LocationsView } from './components/locations/LocationsView';
import { ProductsView } from './components/products/ProductsView';
import { BranchInventoryDrawer } from './components/locations/BranchInventoryDrawer';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'locations' | 'products'>('overview');
  const [activeBranchId, setActiveBranchId] = useState<string>('LOC-001');

  // Relational datasets loaded from AlWakalaDB
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Slide-over drawer state for branch inventory
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLocation, setDrawerLocation] = useState<Location | null>(null);

  // Sync state from LocalStorage database
  const loadDatabaseState = useCallback(() => {
    const currentSession = db.getSession();
    setSession(currentSession);

    const loadedUsers = db.getUsers();
    setUsers(loadedUsers);

    const loadedLocations = db.getLocations();
    setLocations(loadedLocations);

    // If current active branch doesn't exist, fallback to first location
    if (loadedLocations.length > 0) {
      if (!loadedLocations.some((l) => l.id === activeBranchId)) {
        setActiveBranchId(loadedLocations[0].id);
      }
    }

    const loadedProducts = db.getProducts();
    setProducts(loadedProducts);
  }, [activeBranchId]);

  useEffect(() => {
    // Initial sync
    loadDatabaseState();

    // Subscribe to AlWakalaDB changes for instant reactive updates
    const unsubscribe = db.subscribe(() => {
      loadDatabaseState();
    });

    const handleCustomChange = () => {
      loadDatabaseState();
    };
    window.addEventListener('alwakala_db_change', handleCustomChange);

    return () => {
      unsubscribe();
      window.removeEventListener('alwakala_db_change', handleCustomChange);
    };
  }, [loadDatabaseState]);

  const handleLoginSuccess = (newSession: Session) => {
    setSession(newSession);
    setActiveTab('overview');
    loadDatabaseState();
  };

  const handleLogout = () => {
    db.clearSession();
    setSession(null);
  };

  const handleResetDatabase = () => {
    db.resetToBaseline();
    loadDatabaseState();
  };

  const handleOpenBranchDrawer = (loc: Location) => {
    setDrawerLocation(loc);
    setDrawerOpen(true);
  };

  // Session Guard (FR-AUTH-03)
  if (!session) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header & Navigation Tabs (SRS Section 4.1) */}
      <Header
        session={session}
        locations={locations}
        activeBranchId={activeBranchId}
        onBranchChange={setActiveBranchId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onResetDB={handleResetDatabase}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            session={session}
            users={users}
            locations={locations}
            products={products}
            activeBranchId={activeBranchId}
            onNavigateTab={setActiveTab}
            onOpenBranchDrawer={handleOpenBranchDrawer}
          />
        )}

        {activeTab === 'users' && (
          <UsersView users={users} onRefresh={loadDatabaseState} />
        )}

        {activeTab === 'locations' && (
          <LocationsView
            locations={locations}
            products={products}
            activeBranchId={activeBranchId}
            onSelectActiveBranch={setActiveBranchId}
            onRefresh={loadDatabaseState}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            locations={locations}
            activeBranchId={activeBranchId}
            onRefresh={loadDatabaseState}
            onOpenBranchDrawer={handleOpenBranchDrawer}
          />
        )}
      </main>

      {/* Global Slide-Over Drawer for Branch Inventory (FR-LOC-05, FR-LOC-06) */}
      <BranchInventoryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        location={drawerLocation}
        products={products}
        onRefresh={loadDatabaseState}
      />

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Al-Wakala Platform</span>
            <span>·</span>
            <span className="font-ar">منصة إدارة الفروع والمخزون</span>
          </div>
          <div className="flex items-center gap-3">
            <span>AlWakalaDB v1.0 (LocalStorage Prototype)</span>
            <span>·</span>
            <button
              onClick={handleResetDatabase}
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Reset Seed Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
