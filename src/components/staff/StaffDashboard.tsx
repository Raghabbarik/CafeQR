import React, { useState } from 'react';
import type { CafeInfo, Order, StaffAlert, MenuItem, OrderStatus, StaffMember } from '../../types';
import { LiveKDSView } from '../admin/LiveKDSView';
import { MenuManagerView } from '../admin/MenuManagerView';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton';
import {
  ClipboardList,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  LogOut,
  Coffee,
  ArrowLeft,
  BellRing,
  UserCheck
} from 'lucide-react';

export type StaffTab = 'orders' | 'menu';

interface StaffDashboardProps {
  cafe: CafeInfo;
  currentStaff: StaffMember | null;
  orders: Order[];
  alerts: StaffAlert[];
  categories: string[];
  menuItems: MenuItem[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExitStaff: () => void;
  onLogout: () => void;
  onDismissAlert: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onAddItem: (item: any) => Promise<void>;
  onUpdateItem: (id: string, updates: any) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onAddCategory: (category: string) => Promise<void>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  cafe,
  currentStaff,
  orders,
  alerts,
  categories,
  menuItems,
  soundEnabled,
  onToggleSound,
  onExitStaff,
  onLogout,
  onDismissAlert,
  onUpdateOrderStatus,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
}) => {
  const [activeTab, setActiveTab] = useState<StaffTab>('orders');

  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col antialiased text-stone-900">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-stone-900 border-b border-stone-800 text-stone-100 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Staff Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] overflow-hidden bg-stone-950 flex items-center justify-center">
                {cafe.logo ? (
                  <ImageWithSkeleton
                    src={cafe.logo}
                    alt={cafe.name}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                ) : (
                  <Coffee className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-tight">{cafe.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Staff Portal
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>{currentStaff?.name || 'Staff Member'}</span>
                <span className="text-stone-600">&bull;</span>
                <span className="text-[11px] text-stone-400">{currentStaff?.email}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation Switches */}
          <nav className="flex items-center bg-stone-800/80 p-1 rounded-xl border border-stone-700/60">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Kitchen Orders</span>
              {activeOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-stone-950">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menu & Stock</span>
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            
            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-stone-800 text-amber-400 hover:bg-stone-700'
                  : 'bg-stone-800/50 text-stone-500 hover:bg-stone-800'
              }`}
              title={soundEnabled ? 'Mute Kitchen Bell' : 'Enable Kitchen Bell'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* View Customer Menu */}
            <button
              onClick={onExitStaff}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              title="Open Customer View"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Menu</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
              title="Sign Out of Staff Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Staff Alerts Bar (Call Waiter / Water ping) */}
      {alerts.length > 0 && (
        <div className="bg-amber-500 border-b border-amber-600 px-4 py-2 text-stone-950 font-bold text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>Assistance Alert: {alerts[0].tableNumber ? `Customer (${alerts[0].tableNumber})` : 'Customer'} requested {alerts[0].type}!</span>
            <button
              onClick={() => onDismissAlert(alerts[0].id)}
              className="ml-auto px-2 py-0.5 bg-stone-900 text-white rounded text-[11px] font-black cursor-pointer hover:bg-stone-800"
            >
              Attended
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'orders' && (
          <LiveKDSView
            orders={orders}
            alerts={alerts}
            onDismissAlert={onDismissAlert}
            onUpdateStatus={onUpdateOrderStatus}
          />
        )}

        {activeTab === 'menu' && (
          <MenuManagerView
            categories={categories}
            items={menuItems}
            onAddItem={onAddItem}
            onUpdateItem={onUpdateItem}
            onDeleteItem={onDeleteItem}
            onAddCategory={onAddCategory}
          />
        )}
      </main>

    </div>
  );
};
