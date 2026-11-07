import React, { useState, useEffect } from 'react';
import type { Order } from '../../types';
import { api } from '../../services/api';
import {
  Receipt,
  Search,
  Phone,
  User,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';

interface BillLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
  currentOrder?: Order | null;
  initialPhone?: string;
  initialName?: string;
}

export const BillLookupModal: React.FC<BillLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  currentOrder,
  initialPhone = '',
  initialName = '',
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Order[]>([]);
  const [error, setError] = useState('');

  // Prefill phone/name from localStorage or props if available
  useEffect(() => {
    if (isOpen) {
      const savedPhone = initialPhone || localStorage.getItem('cafeqr_customer_phone') || '';
      const savedName = initialName || localStorage.getItem('cafeqr_customer_name') || '';
      if (savedPhone) setPhone(savedPhone);
      if (savedName) setName(savedName);

      // Auto-search if valid phone is already present
      if (savedPhone && savedPhone.replace(/\D/g, '').length >= 10) {
        performSearch(savedPhone, savedName);
      }
    }
  }, [isOpen]);

  const performSearch = async (searchPhone: string, searchName?: string) => {
    setError('');
    setIsLoading(true);
    setHasSearched(true);

    try {
      const orders = await api.lookupOrdersByPhone(searchPhone, searchName);
      setResults(orders || []);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cafeqr_customer_phone', searchPhone.trim());
        if (searchName) localStorage.setItem('cafeqr_customer_name', searchName.trim());
      }
    } catch (err: any) {
      console.error('Lookup bills error:', err);
      setError(err.message || 'Unable to retrieve bills. Please check your phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    performSearch(phone, name);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">Check Past Bills & Orders</h3>
              <p className="text-xs text-stone-500">
                View receipts placed using your phone number
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Active order quick banner if exists */}
          {currentOrder && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Current Visit Active Order</span>
                </div>
                <p className="text-xs text-amber-800 font-medium">
                  Order <span className="font-mono font-bold">{currentOrder.id}</span> &bull;{' '}
                  {currentOrder.diningOption === 'parcel' || String(currentOrder.tableNumber).toLowerCase().includes('parcel')
                    ? '🛍️ Parcel (Takeaway)'
                    : '🍽️ Eat Now (Dine-In)'}{' '}
                  (₹{currentOrder.total})
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectOrder(currentOrder);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer transition-colors"
              >
                View Now →
              </button>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-3.5 bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80">
            
            {/* Phone input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-semibold text-stone-900 transition-all"
                  maxLength={15}
                />
              </div>
            </div>

            {/* Name input (optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Customer Name <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Rahul"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium text-stone-900 transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Search Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching Bills...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find My Bills</span>
                </>
              )}
            </button>
          </form>

          {/* Results List */}
          {hasSearched && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1">
                <span>Orders Found</span>
                <span className="px-2 py-0.5 bg-stone-100 rounded-md font-mono">{results.length}</span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-stone-200 rounded-2xl space-y-1.5">
                  <Receipt className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-800">No Orders Found</p>
                  <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                    We couldn't find any orders placed under this mobile number. Make sure the 10-digit number matches what you typed during payment.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {results.map((ord) => {
                    const formattedDate = new Date(ord.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={ord.id}
                        onClick={() => {
                          onSelectOrder(ord);
                          onClose();
                        }}
                        className="p-3.5 bg-white hover:bg-amber-50/50 border border-stone-200 hover:border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-stone-900 group-hover:text-amber-800">
                              {ord.id}
                            </span>
                            {(() => {
                              const isParcel = ord.diningOption === 'parcel' || String(ord.tableNumber).toLowerCase().includes('parcel');
                              return (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isParcel ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {isParcel ? '🛍️ Parcel' : '🍽️ Eat Now'}
                                </span>
                              );
                            })()}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.orderStatus === 'completed' || ord.orderStatus === 'ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>{formattedDate}</span>
                            <span>&bull;</span>
                            <span className="truncate">{ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2.5">
                          <div className="text-right">
                            <div className="font-black text-sm text-stone-900">₹{ord.total}</div>
                            <div className="text-[10px] font-bold text-emerald-700">PAID</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
