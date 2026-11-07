import React, { useState } from 'react';
import { User, Phone, X, ShieldCheck, ArrowRight } from 'lucide-react';

interface CustomerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onProceedToRazorpay: () => void;
}

export const CustomerCheckoutModal: React.FC<CustomerCheckoutModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  tableNumber,
  customerName,
  customerPhone,
  onNameChange,
  onPhoneChange,
  onProceedToRazorpay,
}) => {
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    onProceedToRazorpay();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-stone-900">Guest Information</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Table #{tableNumber} • Amount to Pay: <span className="font-bold text-amber-800">₹{totalAmount}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Your Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => {
                  onNameChange(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3 py-2.5 bg-stone-50 rounded-xl text-sm text-stone-900 border border-stone-300 outline-none focus:border-amber-600 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={customerPhone}
                onChange={(e) => {
                  onPhoneChange(e.target.value.replace(/\D/g, ''));
                  if (error) setError('');
                }}
                placeholder="9876543210"
                className="w-full pl-17 pr-3 py-2.5 bg-stone-50 rounded-xl text-sm text-stone-900 border border-stone-300 outline-none focus:border-amber-600 focus:bg-white transition-all shadow-inner font-mono"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Your digital bill receipt will be generated under this number.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pay ₹{totalAmount} via Razorpay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Secure Razorpay Payment Gateway</span>
          </div>
        </form>
      </div>
    </div>
  );
};

