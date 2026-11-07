import React from 'react';
import type { CafeInfo } from '../../types';
import { 
  ClipboardList, 
  UtensilsCrossed, 
  QrCode, 
  Settings, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  Coffee
} from 'lucide-react';

interface AdminHeaderProps {
  cafe: CafeInfo;
  activeTab: 'orders' | 'menu' | 'tables' | 'settings';
  onTabChange: (tab: 'orders' | 'menu' | 'tables' | 'settings') => void;
  activeOrdersCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExitAdmin: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  cafe,
  activeTab,
  onTabChange,
  activeOrdersCount,
  soundEnabled,
  onToggleSound,
  onExitAdmin,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-white border-b border-stone-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Return to Customer QR View"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Customer Menu</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <h1 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>{cafe.name}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-mono border border-amber-500/30">
                    Staff Portal
                  </span>
                </h1>
                <p className="text-[11px] text-stone-400">Direct Staff Access (No Login Required)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio chime toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                soundEnabled
                  ? 'bg-amber-600/20 text-amber-300 border-amber-600/40 hover:bg-amber-600/30'
                  : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
              }`}
              title={soundEnabled ? 'Mute Kitchen Chime' : 'Unmute Kitchen Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-2">
          <button
            onClick={() => onTabChange('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Live Kitchen Orders</span>
            {activeOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Manage Menu & Stock</span>
          </button>

          <button
            onClick={() => onTabChange('tables')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tables'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Table QR Codes</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cafe Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
