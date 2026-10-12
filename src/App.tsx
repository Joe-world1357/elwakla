import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import { Session, User, Location, Product } from './types';
import { getRolePermissions } from './services/auth';
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
  const [activeBranchId, setActiveBranchId] = useState<string>('');

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

    // If active branch doesn't exist, set to first location or blank if no locations
    if (loadedLocations.length > 0) {
      if (!loadedLocations.some((l) => l.id === activeBranchId)) {
        setActiveBranchId(loadedLocations[0].id);
      }
    } else {
      setActiveBranchId('');
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

  // Tab Access Guard based on IAM Role Permissions
  useEffect(() => {
    if (session) {
      const perms = getRolePermissions(session.role);
      if (activeTab === 'users' && !perms.canViewUsers) {
        setActiveTab('overview');
      } else if (activeTab === 'locations' && !perms.canViewLocations) {
        setActiveTab('overview');
      } else if (activeTab === 'products' && !perms.canViewCatalog) {
        setActiveTab('overview');
      }
    }
  }, [session, activeTab]);

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

  const permissions = getRolePermissions(session.role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header & Navigation Tabs */}
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

      {/* Main Viewport Content with IAM Role Enforcement */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            session={session}
            users={users}
            locations={locations}
            products={products}
            permissions={permissions}
            activeBranchId={activeBranchId}
            onNavigateTab={setActiveTab}
            onOpenBranchDrawer={handleOpenBranchDrawer}
          />
        )}

        {activeTab === 'users' && (
          <UsersView
            users={users}
            session={session}
            permissions={permissions}
            onRefresh={loadDatabaseState}
          />
        )}

        {activeTab === 'locations' && (
          <LocationsView
            locations={locations}
            products={products}
            session={session}
            permissions={permissions}
            activeBranchId={activeBranchId}
            onSelectActiveBranch={setActiveBranchId}
            onRefresh={loadDatabaseState}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            locations={locations}
            session={session}
            permissions={permissions}
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
        permissions={permissions}
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
            <span>Clean In-Browser LocalStorage Database</span>
            {permissions.canResetDatabase && (
              <>
                <span>·</span>
                <button
                  onClick={handleResetDatabase}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Reset to Clean Slate
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
