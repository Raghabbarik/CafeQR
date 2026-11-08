import React, { useState } from 'react';
import type { CafeInfo, Order, StaffAlert, MenuItem, OrderStatus } from '../../types';
import { AdminSidebar, type AdminTab } from './AdminSidebar';
import { LiveKDSView } from './LiveKDSView';
import { HeroCustomizerView } from './HeroCustomizerView';
import { MenuManagerView } from './MenuManagerView';
import { CafeSettingsView } from './CafeSettingsView';
import { AnalyticsView } from './AnalyticsView';
import { StaffManagerView } from './StaffManagerView';
import { FeedbackManagerView } from './FeedbackManagerView';
import { Menu, ArrowLeft, BellRing, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { sound } from '../../services/sound';

interface AdminDashboardProps {
  cafe: CafeInfo;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  orders: Order[];
  alerts: StaffAlert[];
  categories: string[];
  menuItems: MenuItem[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExitAdmin: () => void;
  onDismissAlert: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onAddItem: (item: any) => Promise<void>;
  onUpdateItem: (id: string, updates: any) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onAddCategory: (category: string) => Promise<void>;
  onUpdateCafeSettings: (updates: Partial<CafeInfo>) => Promise<void>;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cafe,
  adminTab,
  setAdminTab,
  orders,
  alerts,
  categories,
  menuItems,
  soundEnabled,
  onToggleSound,
  onExitAdmin,
  onLogout,
  onDismissAlert,
  onUpdateOrderStatus,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
  onUpdateCafeSettings,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cafeqr_admin_sidebar_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('cafeqr_admin_sidebar_open', String(next));
      }
      return next;
    });
  };

  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  ).length;

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    orders: {
      title: 'Kitchen Display System (KDS)',
      subtitle: 'Real-time kitchen order tickets & live customer status tracking',
    },
    hero: {
      title: 'Hero / Welcome Screen Customizer',
      subtitle: 'Customize background photo, headline, logo, and badge text',
    },
    menu: {
      title: 'Menu & Inventory Management',
      subtitle: 'Add items, update pricing, diet tags, and stock availability',
    },
    analytics: {
      title: 'Sales & Revenue Analytics',
      subtitle: 'Live reporting, order history, and best-selling dishes',
    },
    settings: {
      title: 'Cafe Branding & Store Settings',
      subtitle: 'Configure store details, tax rate, Wi-Fi credentials, and Razorpay',
    },
    staff: {
      title: 'Staff Accounts & TV Display Screen',
      subtitle: 'Assign staff members for Kitchen/Menu access and configure TV order status PIN',
    },
    reviews: {
      title: 'Customer Feedback & Reviews Control',
      subtitle: 'Approve, moderate, feature and manage dish reviews from verified diners',
    },
  };

  const currentTabInfo = tabTitles[adminTab] || tabTitles.orders;

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row antialiased text-stone-900">
      
      {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <AdminSidebar
        cafe={cafe}
        activeTab={adminTab}
        onTabChange={setAdminTab}
        activeOrdersCount={activeOrdersCount}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onExitAdmin={onExitAdmin}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        onToggleDesktop={handleToggleDesktopSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
          
          <div className="flex items-center gap-3">
            {/* Sidebar Open / Close Button (Works for both Mobile & Desktop) */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                } else {
                  handleToggleDesktopSidebar();
                }
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer transition-colors flex items-center gap-2 border border-stone-200/80 shadow-2xs"
              title={
                isDesktopSidebarOpen
                  ? 'Close Sidebar Menu'
                  : 'Open Sidebar Menu'
              }
            >
              {isDesktopSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 hidden md:block text-stone-700" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 hidden md:block text-amber-700" />
              )}
              <Menu className="w-5 h-5 md:hidden text-stone-700" />
              <span className="text-xs font-bold hidden md:inline text-stone-700">
                {isDesktopSidebarOpen ? 'Close Menu' : 'Open Menu'}
              </span>
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-tight">
                {currentTabInfo.title}
              </h1>
              <p className="hidden sm:block text-xs text-stone-500 font-medium">
                {currentTabInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2">
            {/* Quick Store Open/Close Status Toggle */}
            <button
              onClick={() => onUpdateCafeSettings({ isOpen: cafe.isOpen === false ? true : false })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all shadow-xs cursor-pointer ${
                cafe.isOpen !== false
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800'
              }`}
              title={cafe.isOpen !== false ? 'Store is OPEN for orders (Click to Close)' : 'Store is CLOSED (Click to Open)'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  cafe.isOpen !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline">
                {cafe.isOpen !== false ? 'Store: OPEN' : 'Store: CLOSED'}
              </span>
              <span className="sm:hidden">
                {cafe.isOpen !== false ? 'Open' : 'Closed'}
              </span>
            </button>

            {/* Quick Kitchen Sound bell */}
            <button
              onClick={() => sound.playOrderBell()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
              title="Test Sound"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>Chime</span>
            </button>

            {/* Quick Exit to Customer Menu */}
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer Menu</span>
              <span className="sm:hidden">Exit</span>
            </button>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                title="Sign Out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>

        </header>

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {adminTab === 'orders' && (
            <LiveKDSView
              orders={orders}
              alerts={alerts}
              onDismissAlert={onDismissAlert}
              onUpdateStatus={onUpdateOrderStatus}
            />
          )}

          {adminTab === 'hero' && (
            <HeroCustomizerView cafe={cafe} onSave={onUpdateCafeSettings} />
          )}

          {adminTab === 'menu' && (
            <MenuManagerView
              categories={categories}
              items={menuItems}
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onAddCategory={onAddCategory}
            />
          )}

          {adminTab === 'reviews' && (
            <FeedbackManagerView menuItems={menuItems} />
          )}

          {adminTab === 'analytics' && (
            <AnalyticsView orders={orders} cafe={cafe} />
          )}

          {adminTab === 'settings' && (
            <CafeSettingsView cafe={cafe} onSave={onUpdateCafeSettings} />
          )}

          {adminTab === 'staff' && (
            <StaffManagerView cafe={cafe} />
          )}
        </main>

      </div>

    </div>
  );
};