import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Bell, Sparkles, X, ChevronRight } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'order_confirmed' | 'order_preparing' | 'order_ready' | 'order_completed' | 'new_order' | 'staff_alert' | 'info';
  title: string;
  message: string;
  orderId?: string;
  onClick?: () => void;
  duration?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 inset-x-4 z-50 pointer-events-none flex flex-col items-center gap-2.5 max-w-md mx-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 280);
  };

  const getStyle = () => {
    switch (toast.type) {
      case 'order_ready':
        return {
          bg: 'bg-emerald-950 text-white border-emerald-500/50 shadow-emerald-900/30 ring-2 ring-emerald-400/40',
          iconBg: 'bg-emerald-500 text-white animate-bounce',
          icon: <Sparkles className="w-5 h-5" />,
          badge: 'Ready for Pickup ☕',
          badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'order_preparing':
        return {
          bg: 'bg-amber-950 text-white border-amber-600/50 shadow-amber-900/30',
          iconBg: 'bg-amber-500 text-amber-950',
          icon: <Clock className="w-5 h-5 animate-spin" />,
          badge: 'In Kitchen 👨‍🍳',
          badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'order_confirmed':
        return {
          bg: 'bg-stone-900 text-white border-emerald-600/40 shadow-black/40',
          iconBg: 'bg-emerald-600 text-white',
          icon: <CheckCircle2 className="w-5 h-5" />,
          badge: 'Confirmed ✓',
          badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'staff_alert':
        return {
          bg: 'bg-rose-950 text-white border-rose-600/50 shadow-rose-900/30 ring-2 ring-rose-400/30',
          iconBg: 'bg-rose-500 text-white animate-pulse',
          icon: <Bell className="w-5 h-5" />,
          badge: 'Table Alert 🛎️',
          badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      default:
        return {
          bg: 'bg-stone-900 text-white border-stone-700/80 shadow-black/40',
          iconBg: 'bg-amber-600 text-white',
          icon: <Bell className="w-5 h-5" />,
          badge: 'Update',
          badgeStyle: 'bg-white/10 text-stone-200 border-white/20',
        };
    }
  };

  const s = getStyle();

  return (
    <div
      onClick={() => {
        if (toast.onClick) {
          toast.onClick();
          handleClose();
        }
      }}
      className={`pointer-events-auto w-full p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 transition-all duration-300 select-none cursor-pointer ${
        s.bg
      } ${
        isLeaving
          ? 'opacity-0 -translate-y-4 scale-95'
          : 'animate-in slide-in-from-top-4 fade-in duration-300'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${s.iconBg}`}>
          {s.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.badgeStyle}`}>
              {s.badge}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-white mt-1 truncate">
            {toast.title}
          </h4>
          <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
            {toast.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {toast.onClick && (
          <span className="p-1 text-stone-400 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
