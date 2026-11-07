import React, { useState } from 'react';
import type { CafeInfo } from '../../types';
import { X, ShieldCheck, QrCode, CreditCard, Building2, Smartphone, CheckCircle, Loader2 } from 'lucide-react';

interface RazorpaySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafe: CafeInfo;
  amount: number;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  onSuccess: (paymentId: string) => void;
}

export const RazorpaySimulatorModal: React.FC<RazorpaySimulatorModalProps> = ({
  isOpen,
  onClose,
  cafe,
  amount,
  customerName,
  customerPhone,
  tableNumber,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'processing' | 'done'>('select');

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setStep('processing');

    setTimeout(() => {
      setIsProcessing(false);
      setStep('done');

      setTimeout(() => {
        const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        onSuccess(mockPaymentId);
      }, 700);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={cafe.logo}
              alt={cafe.name}
              className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-white"
            />
            <div>
              <p className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">
                Paying to {cafe.name}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">₹{amount}</span>
                <span className="text-xs text-blue-200">(Table #{tableNumber})</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-blue-200 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Razorpay Banner Bar */}
        <div className="bg-[#183962] px-4 py-1.5 text-xs text-blue-100 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="font-extrabold text-blue-300">Razorpay</span>
            <span className="opacity-80">Trusted Business</span>
          </span>
          <span className="font-mono text-[11px] text-blue-200">{customerName} • +91 {customerPhone}</span>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {step === 'processing' ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="text-base font-bold text-stone-900">Authorizing Payment...</p>
              <p className="text-xs text-stone-500">Please do not refresh or close this screen.</p>
            </div>
          ) : step === 'done' ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-stone-900">Payment Verified!</h4>
              <p className="text-xs text-stone-500">Generating digital receipt & sending order to kitchen...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Method Details */}
              {selectedMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-700">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Scan & Pay with Any UPI App</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl inline-block border border-stone-200 shadow-xs">
                    {/* Visual QR placeholder */}
                    <div className="w-32 h-32 bg-stone-900 rounded-lg p-2 flex flex-col justify-between items-center text-white text-[10px] font-mono">
                      <div className="w-full flex justify-between">
                        <div className="w-6 h-6 border-2 border-white rounded-xs" />
                        <div className="w-6 h-6 border-2 border-white rounded-xs" />
                      </div>
                      <div className="text-[11px] font-bold text-amber-400">₹{amount}</div>
                      <div className="w-full flex justify-between">
                        <div className="w-6 h-6 border-2 border-white rounded-xs" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 text-[10px] text-stone-500 font-semibold">
                    <span className="px-2 py-0.5 bg-white rounded border border-stone-200">GPay</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-stone-200">PhonePe</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-stone-200">Paytm</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-stone-200">Cred</span>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Card Number</label>
                    <input
                      type="text"
                      disabled
                      value="4111 •••• •••• 1111 (Demo Card)"
                      className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-mono text-stone-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">Expiry</label>
                      <input
                        type="text"
                        disabled
                        value="12 / 28"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-mono text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">CVV</label>
                      <input
                        type="password"
                        disabled
                        value="123"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-stone-300 font-mono text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 gap-2 text-xs">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                    <div
                      key={bank}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold flex items-center gap-2 hover:border-blue-500 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span className="truncate">{bank}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0c2340] hover:bg-[#153a6b] text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Pay ₹{amount} (Instant Verification)</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PCI-DSS Compliant • 256-bit Encryption</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
