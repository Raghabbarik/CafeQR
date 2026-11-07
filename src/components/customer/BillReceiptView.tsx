import React, { useEffect } from 'react';
import type { Order, CafeInfo, OrderStatus } from '../../types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Printer, 
  Utensils, 
  Sparkles, 
  ChefHat, 
  PartyPopper,
  ArrowLeft,
  Phone,
  User
} from 'lucide-react';

interface BillReceiptViewProps {
  order: Order;
  cafe: CafeInfo;
  onOrderMore: () => void;
}

export const BillReceiptView: React.FC<BillReceiptViewProps> = ({
  order,
  cafe,
  onOrderMore,
}) => {
  // Fire confetti celebration on receipt generation
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b45309', '#d97706', '#f59e0b', '#10b981'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'received', label: 'Order Received', desc: 'Sent to Kitchen' },
    { key: 'preparing', label: 'Preparing', desc: 'Chef is cooking' },
    { key: 'ready', label: 'Ready to Serve', desc: 'On its way to table' },
    { key: 'completed', label: 'Completed', desc: 'Enjoy your meal!' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-stone-100 py-6 px-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Navigation & Print Actions (Hidden when printing) */}
        <div className="flex items-center justify-between no-print">
          <button
            onClick={onOrderMore}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Order More</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-800" />
            <span>Print Bill</span>
          </button>
        </div>

        {/* Live Order Status Banner (No-print) */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-md no-print space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Live Kitchen Status
              </span>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
              order.orderStatus === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : order.orderStatus === 'ready'
                ? 'bg-blue-100 text-blue-800 animate-pulse'
                : order.orderStatus === 'preparing'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-stone-100 text-stone-800'
            }`}>
              {order.orderStatus}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative pt-2 pb-1">
            <div className="flex items-center justify-between relative z-10">
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-amber-800 text-white ring-4 ring-amber-200 scale-110 shadow-sm'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {idx === 0 ? <CheckCircle2 className="w-4 h-4" /> :
                       idx === 1 ? <ChefHat className="w-4 h-4" /> :
                       idx === 2 ? <Utensils className="w-4 h-4" /> :
                       <PartyPopper className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 leading-tight ${
                      isCurrent ? 'text-amber-900' : isPassed ? 'text-stone-800' : 'text-stone-400'
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] text-stone-400 hidden sm:block">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Connecting Bar */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-stone-200 -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================= Printable Digital Bill ================= */}
        <div
          id="printable-bill"
          className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xl relative overflow-hidden font-sans text-stone-800"
        >
          {/* Subtle Decorative Header Wave */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800" />

          {/* 1. Cafe Logo & Name */}
          <div className="text-center pt-2 pb-4 border-b border-dashed border-stone-300">
            <img
              src={cafe.logo}
              alt={cafe.name}
              className="w-16 h-16 rounded-2xl mx-auto object-cover border border-amber-200 shadow-xs mb-2 bg-white"
            />
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              {cafe.name}
            </h2>

            {/* 2. Small Line / Cafe Tagline */}
            <p className="text-xs font-serif italic text-amber-900 mt-1 max-w-xs mx-auto">
              "{cafe.tagline}"
            </p>

            <p className="text-[11px] text-stone-500 mt-1">{cafe.address}</p>
            <p className="text-[10px] text-stone-400 font-mono">Ph: {cafe.phone}</p>
          </div>

          {/* Bill Meta Info */}
          <div className="py-3.5 border-b border-dashed border-stone-300 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Order ID</span>
              <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Table Number</span>
              <span className="font-extrabold text-amber-900 text-sm bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                Table #{order.tableNumber}
              </span>
            </div>
            <div className="flex items-center gap-1 text-stone-600">
              <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="font-medium truncate">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-stone-600 font-mono text-[11px]">
              <Phone className="w-3 h-3 text-stone-400 shrink-0" />
              <span>{order.customerPhone}</span>
            </div>
            <div className="col-span-2 text-[10px] text-stone-400 flex items-center justify-between pt-1">
              <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
              <span>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* 3. Orders Itemized List */}
          <div className="py-4 border-b border-dashed border-stone-300">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400 pb-2">
              <span>Item & Qty</span>
              <span>Amount</span>
            </div>
            <div className="space-y-2 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex items-start gap-2 max-w-[70%]">
                    <span className="font-mono text-stone-500 font-bold">{item.quantity}x</span>
                    <div>
                      <span className="font-semibold text-stone-900">{item.name}</span>
                      <span className="text-[10px] text-stone-400 block">@ ₹{item.price}</span>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-3 p-2 rounded-lg bg-stone-50 text-[11px] text-stone-600 border border-stone-200 italic">
                Note: "{order.notes}"
              </div>
            )}
          </div>

          {/* 4. Total Bill Breakdown */}
          <div className="py-3.5 border-b border-dashed border-stone-300 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-stone-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Taxes ({order.taxRate}%)</span>
              <span className="font-medium text-stone-900">₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-stone-950 pt-2 border-t border-stone-200">
              <span>Grand Total</span>
              <span className="text-amber-900">₹{order.total}</span>
            </div>
          </div>

          {/* Payment & Order Status */}
          <div className="pt-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PAID via Razorpay</span>
              </div>
              <span className="font-mono text-[10px] text-stone-400">
                Ref: {order.paymentId}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
              <span className="font-semibold text-stone-700">Order Status</span>
              <span className="font-extrabold uppercase tracking-wider text-amber-900 text-xs">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-5 text-[10px] text-stone-400 space-y-1">
            <p>Thank you for dining with us at {cafe.name}!</p>
            <p className="font-mono">Have a wonderful and tasty day ☕</p>
          </div>
        </div>

        {/* Bottom Button to order more */}
        <div className="pt-2 no-print">
          <button
            onClick={onOrderMore}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Order Another Item / Beverage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
