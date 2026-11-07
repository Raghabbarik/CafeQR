import React, { useState } from 'react';
import { X, Bell, Droplets, Utensils, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
}

export const CallWaiterModal: React.FC<CallWaiterModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
}) => {
  const [selectedType, setSelectedType] = useState<string>('Drinking Water');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const options = [
    { label: 'Drinking Water', icon: Droplets, desc: 'Bring fresh drinking water' },
    { label: 'Cutlery & Napkins', icon: Utensils, desc: 'Extra spoons, forks, tissue' },
    { label: 'Server Assistance', icon: Bell, desc: 'Call staff to Table #' + tableNumber },
    { label: 'Physical Bill / Receipt', icon: FileText, desc: 'Request paper receipt' },
  ];

  const handleSend = async () => {
    setIsSubmitting(true);
    try {
      await api.callAssistance(tableNumber, selectedType);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch {
      setIsSubmitting(false);
    }
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

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <h3 className="text-lg font-extrabold text-stone-900">Call Table Staff</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Table #{tableNumber} • A staff member will arrive shortly.
          </p>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-stone-900 text-base">Server Notified!</h4>
            <p className="text-xs text-stone-500">Staff is on the way to Table #{tableNumber}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedType(opt.label)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[11px] text-stone-400 font-normal">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSend}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Ring Waiter Bell</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
