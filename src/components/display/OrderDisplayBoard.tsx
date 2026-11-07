import React, { useState, useEffect } from 'react';
import type { CafeInfo, Order } from '../../types';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { sound } from '../../services/sound';
import {
  Tv,
  Lock,
  KeyRound,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Coffee,
  CheckCircle2,
  ChefHat,
  BellRing,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface OrderDisplayBoardProps {
  cafe: CafeInfo;
  onExitToCustomer?: () => void;
}

export const OrderDisplayBoard: React.FC<OrderDisplayBoardProps> = ({ cafe, onExitToCustomer }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  // 1. Check if previously unlocked in localStorage
  useEffect(() => {
    const savedPin = localStorage.getItem('cafeqr_tv_unlocked_pin');
    if (savedPin) {
      // Verify with backend
      api.verifyDisplayCode(savedPin)
        .then((valid) => {
          if (valid) {
            setIsUnlocked(true);
          } else {
            localStorage.removeItem('cafeqr_tv_unlocked_pin');
          }
        })
        .catch(() => {
          // If offline or fallback, check against cafe config
          if (cafe.orderDisplayCode && savedPin === cafe.orderDisplayCode) {
            setIsUnlocked(true);
          }
        });
    }
  }, [cafe.orderDisplayCode]);

  // 2. Fetch live orders & setup socket listeners
  useEffect(() => {
    if (!isUnlocked) return;

    api.getOrders()
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error('Failed to load orders for display:', err));

    const handleNewOrder = (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    };

    const handleUpdatedOrder = (updatedOrder: Order) => {
      setOrders((prev) => {
        const existing = prev.find((o) => o.id === updatedOrder.id);
        // If order just became 'ready', play chime
        if (existing && existing.orderStatus !== 'ready' && updatedOrder.orderStatus === 'ready') {
          if (soundEnabled) {
            sound.playStatusChime();
          }
        }
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      });
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', handleUpdatedOrder);

    // Fallback polling for Vercel Serverless / WebSocket disconnection
    const pollTimer = setInterval(() => {
      if (!socket.connected) {
        api.getOrders()
          .then((data) => {
            if (Array.isArray(data)) setOrders(data);
          })
          .catch(() => {});
      }
    }, 5000);

    return () => {
      clearInterval(pollTimer);
      socket.off('order:new', handleNewOrder);
      socket.off('order:updated', handleUpdatedOrder);
    };
  }, [isUnlocked, soundEnabled]);

  // 3. Digital Clock Live Updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 4. Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!pinCode.trim()) {
      setPinError('Please enter the access PIN code.');
      return;
    }

    setIsVerifying(true);
    try {
      const valid = await api.verifyDisplayCode(pinCode.trim());
      if (valid || (cafe.orderDisplayCode && pinCode.trim() === cafe.orderDisplayCode)) {
        localStorage.setItem('cafeqr_tv_unlocked_pin', pinCode.trim());
        setIsUnlocked(true);
      } else {
        setPinError('Incorrect PIN code. Ask your Cafe Admin for the code.');
      }
    } catch {
      if (cafe.orderDisplayCode && pinCode.trim() === cafe.orderDisplayCode) {
        localStorage.setItem('cafeqr_tv_unlocked_pin', pinCode.trim());
        setIsUnlocked(true);
      } else {
        setPinError('Unable to verify PIN. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLockScreen = () => {
    localStorage.removeItem('cafeqr_tv_unlocked_pin');
    setIsUnlocked(false);
    setPinCode('');
  };

  // Filter orders for display board
  // PREPARING: received or preparing
  const preparingOrders = orders.filter(
    (o) => o.orderStatus === 'preparing' || o.orderStatus === 'received'
  );

  // READY: ready (and optionally very recent completed within 1 minute)
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready');

  // Format order ID for big TV display (e.g. ORD-10492-381 -> #10492 or last 4 digits)
  const formatDisplayId = (id: string) => {
    if (!id) return '';
    const parts = id.split('-');
    if (parts.length >= 2) return `#${parts[1]}`;
    return `#${id.slice(-5)}`;
  };

  // If locked, show Access PIN Modal
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between p-4 sm:p-6 relative select-none antialiased">
        
        {/* Ambient Subtle Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-emerald-100/50 blur-[130px] rounded-full pointer-events-none" />

        {/* Top Link */}
        <header className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Tv className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-stone-800">TV Display Gateway</span>
          </div>
          {onExitToCustomer && (
            <button
              onClick={onExitToCustomer}
              className="text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Exit to Menu →
            </button>
          )}
        </header>

        {/* PIN Entry Card */}
        <main className="relative z-10 w-full max-w-md mx-auto my-auto">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
                <Tv className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Protected Screen</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Enter TV Display Code
              </h1>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                This TV screen shows real-time order readiness for customers. Enter the PIN code configured in your Cafe Admin panel.
              </p>
            </div>

            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <KeyRound className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter PIN Code"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-lg font-black tracking-widest text-center font-mono transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm tracking-wide shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Unlocking Screen...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Live TV Display</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500">
              Default code is <span className="font-mono font-bold text-stone-800">8899</span> unless changed in Admin Panel &rarr; Staff & TV Screen
            </div>

          </div>
        </main>

        <footer className="relative z-10 text-center py-4 text-[11px] text-stone-500">
          &copy; {new Date().getFullYear()} {cafe.name} &bull; CafeQR TV Display
        </footer>

      </div>
    );
  }

  // UNLOCKED TV DISPLAY BOARD (CLEAN WHITE BACKGROUND)
  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between select-none antialiased overflow-hidden">
      
      {/* High-Contrast Crisp White TV Header */}
      <header className="bg-white border-b border-stone-200/90 px-6 sm:px-10 py-4 flex items-center justify-between shadow-xs shrink-0">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
              {cafe.logo ? (
                <img src={cafe.logo} alt={cafe.name} className="w-full h-full object-cover" />
              ) : (
                <Coffee className="w-6 h-6 text-amber-700" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                {cafe.name}
              </h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live Orders
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              {cafe.tagline || 'Artisanal Coffee & Fresh Gourmet Bites'}
            </p>
          </div>
        </div>

        {/* Live Digital Clock & TV Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Digital Clock */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 px-4 py-2 rounded-2xl shadow-xs">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-mono font-black text-base sm:text-lg text-stone-900 tracking-wider">
              {currentTime}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) sound.playStatusChime();
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
            }`}
            title={soundEnabled ? 'Order Bell Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 shadow-xs transition-all cursor-pointer"
            title="Toggle Fullscreen for TV Display"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Lock Screen */}
          <button
            onClick={handleLockScreen}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Lock Display"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>

      </header>

      {/* Main Dual-Column Order Status Board (White Canvas) */}
      <main className="flex-1 bg-[#f8f9fa] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 overflow-y-auto">
        
        {/* COLUMN 1: PREPARING (IN KITCHEN) */}
        <section className="bg-white rounded-3xl border border-amber-200/90 p-6 flex flex-col shadow-sm relative overflow-hidden">
          
          {/* Subtle amber ambient glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-100/60 blur-[80px] rounded-full pointer-events-none" />

          {/* Column Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-stone-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shadow-xs">
                <ChefHat className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight uppercase">
                  Preparing
                </h2>
                <p className="text-xs text-stone-500 font-medium">Crafting in Kitchen</p>
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-mono font-black text-base shadow-xs">
              {preparingOrders.length}
            </span>
          </div>

          {/* Orders List / Grid */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-stone-400">
                <Coffee className="w-12 h-12 mb-3 text-stone-300 stroke-[1.5]" />
                <p className="font-bold text-sm text-stone-600">Kitchen is All Caught Up!</p>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  New orders will appear here automatically as soon as customers place them.
                </p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all shadow-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-xl sm:text-2xl text-amber-800 tracking-wider">
                        {formatDisplayId(order.id)}
                      </span>
                      {(() => {
                        const isParcel = order.diningOption === 'parcel' || String(order.tableNumber).toLowerCase().includes('parcel');
                        return (
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 ${
                            isParcel ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            <span>{isParcel ? '🛍️' : '🍽️'}</span>
                            <span>{isParcel ? 'Parcel' : 'Eat Now'}</span>
                          </span>
                        );
                      })()}
                    </div>

                    <div className="text-base font-extrabold text-stone-900 truncate">
                      {order.customerName}
                    </div>

                    <div className="text-xs text-stone-500 font-medium">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} &bull;{' '}
                      {order.items.map((i) => i.name).slice(0, 2).join(', ')}
                      {order.items.length > 2 && '...'}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 border border-amber-200 text-amber-800 uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Cooking
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </section>

        {/* COLUMN 2: READY FOR PICKUP / SERVING (High-Impact Glowing Emerald) */}
        <section className="bg-white rounded-3xl border-2 border-emerald-300 p-6 flex flex-col shadow-sm relative overflow-hidden ring-4 ring-emerald-500/10">
          
          {/* Subtle emerald ambient glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100/60 blur-[80px] rounded-full pointer-events-none" />

          {/* Column Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-emerald-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-xs">
                <BellRing className="w-6 h-6 animate-bounce text-emerald-700" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight uppercase">
                  Ready to Serve
                </h2>
                <p className="text-xs text-stone-500 font-medium">Please Collect at Counter or Service Area</p>
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono font-black text-base shadow-xs">
              {readyOrders.length}
            </span>
          </div>

          {/* Orders List / Grid */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-stone-400">
                <CheckCircle2 className="w-12 h-12 mb-3 text-stone-300 stroke-[1.5]" />
                <p className="font-bold text-sm text-stone-600">All Ready Orders Have Been Served</p>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  Orders ready for pickup will appear here in vibrant green!
                </p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gradient-to-r from-emerald-50/90 via-white to-white border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all shadow-md shadow-emerald-600/10 animate-in fade-in zoom-in-95 duration-300"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-700 tracking-wider">
                        {formatDisplayId(order.id)}
                      </span>
                      {(() => {
                        const isParcel = order.diningOption === 'parcel' || String(order.tableNumber).toLowerCase().includes('parcel');
                        return (
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 ${
                            isParcel ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            <span>{isParcel ? '🛍️' : '🍽️'}</span>
                            <span>{isParcel ? 'Parcel' : 'Eat Now'}</span>
                          </span>
                        );
                      })()}
                    </div>

                    <div className="text-base sm:text-lg font-black text-stone-900 truncate flex items-center gap-2">
                      <span>{order.customerName}</span>
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>

                    <div className="text-xs text-emerald-800 font-bold">
                      Order is freshly prepared and ready to enjoy!
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-wider shadow-md shadow-emerald-600/20 animate-pulse">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready Now
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </section>

      </main>

      {/* TV Screen Footer Banner */}
      <footer className="bg-white border-t border-stone-200/90 px-6 sm:px-10 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-stone-700">Explore our delicious cafe menu and order directly from your phone.</span>
        </div>

        <div className="text-stone-500 font-mono text-[11px] font-semibold">
          CafeQR Live Kitchen Sync &bull; Auto-Refreshes Instantly
        </div>
      </footer>

    </div>
  );
};

