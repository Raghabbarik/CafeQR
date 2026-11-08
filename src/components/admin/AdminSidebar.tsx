import React from 'react';
import type { CafeInfo } from '../../types';
import {
  ClipboardList,
  UtensilsCrossed,
  Settings,
  Volume2,
  VolumeX,
  ArrowLeft,
  Coffee,
  BarChart3,
  BellRing,
  Sparkles,
  X,
  Radio,
  LogOut,
  Users,
  PanelLeftClose,
  MessageSquareHeart
} from 'lucide-react';
import { sound } from '../../services/sound';

export type AdminTab = 'orders' | 'hero' | 'menu' | 'reviews' | 'analytics' | 'settings' | 'staff';

interface AdminSidebarProps {
  cafe: CafeInfo;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  activeOrdersCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDesktopOpen?: boolean;
  onToggleDesktop?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  cafe,
  activeTab,
  onTabChange,
  activeOrdersCount,
  soundEnabled,
  onToggleSound,
  onExitAdmin,
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
  isDesktopOpen = true,
  onToggleDesktop,
}) => {
  const navItems = [
    {
      id: 'orders' as AdminTab,
      label: 'Live Kitchen (KDS)',
      icon: ClipboardList,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-stone-950 font-black',
    },
    {
      id: 'hero' as AdminTab,
      label: 'Hero Page Editor',
      icon: Sparkles,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold',
    },
    {
      id: 'menu' as AdminTab,
      label: 'Menu & Stock',
      icon: UtensilsCrossed,
    },
    {
      id: 'reviews' as AdminTab,
      label: 'Guest Reviews & Feedback',
      icon: MessageSquareHeart,
    },
    {
      id: 'analytics' as AdminTab,
      label: 'Sales & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Cafe Settings',
      icon: Settings,
    },
    {
      id: 'staff' as AdminTab,
      label: 'Staff & TV Display',
      icon: Users,
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#121110] text-stone-300 select-none border-r border-stone-800/80">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow-lg shadow-amber-950/40">
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-stone-900 flex items-center justify-center">
              {cafe.logo ? (
                <img src={cafe.logo} alt={cafe.name} className="w-full h-full object-cover" />
              ) : (
                <Coffee className="w-5 h-5 text-amber-400" />
              )}
            </div>
          </div>

          <div className="leading-tight">
            <h2 className="font-extrabold text-white text-sm tracking-tight truncate max-w-[140px]">
              {cafe.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono tracking-wide">
                Staff Portal
              </span>
            </div>
          </div>
        </div>

        {/* Close button (works on desktop and mobile) */}
        <button
          onClick={() => {
            if (isMobileOpen) {
              setIsMobileOpen(false);
            } else if (onToggleDesktop) {
              onToggleDesktop();
            }
          }}
          className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer transition-colors"
          title="Close Sidebar Menu"
        >
          <PanelLeftClose className="w-5 h-5 hidden md:block" />
          <X className="w-5 h-5 md:hidden" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-black tracking-widest text-stone-500 uppercase">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-amber-500 text-stone-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Audio Controls & Test Bell */}
      <div className="p-3 mx-3 mb-3 bg-stone-900/90 rounded-2xl border border-stone-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-300 px-1">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            Kitchen Chime
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => sound.playOrderBell()}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 transition-colors cursor-pointer"
              title="Test Kitchen Sound"
            >
              <BellRing className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40'
                  : 'bg-stone-800 text-stone-500'
              }`}
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Return to Customer View & Sign Out */}
      <div className="p-3 border-t border-stone-800/80 space-y-2">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-stone-400" />
          <span>Customer Menu</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out (JWT)</span>
          </button>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent / Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${
          isDesktopOpen
            ? 'w-64 lg:w-72 opacity-100'
            : 'w-0 opacity-0 overflow-hidden pointer-events-none'
        }`}
      >
        <div className="w-64 lg:w-72 h-full flex flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Sheet */}
          <div className="relative z-10 w-72 max-w-[85%] h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};