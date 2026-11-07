import React, { useState } from 'react';
import type { CafeInfo } from '../../types';
import { api } from '../../services/api';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Coffee, Loader2 } from 'lucide-react';

interface AdminLoginViewProps {
  cafe: CafeInfo | null;
  onLoginSuccess: (admin: { email: string; role: string }) => void;
  onExitToCustomer: () => void;
  onGoToStaff?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  cafe,
  onLoginSuccess,
  onExitToCustomer,
  onGoToStaff,
}) => {
  const [email, setEmail] = useState('cafemanue@gmail.com');
  const [password, setPassword] = useState('Cafemanue@2062');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.loginAdmin({
        email: email.trim(),
        password: password.trim(),
      });
      onLoginSuccess(res.admin);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11100f] text-stone-200 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar Return Button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10 pt-2">
        <button
          onClick={onExitToCustomer}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white bg-stone-900/80 hover:bg-stone-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-stone-800"
        >
          <ArrowLeft className="w-4 h-4 text-stone-400" />
          <span>Customer Menu</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400 bg-stone-900/60 px-3 py-1.5 rounded-xl border border-stone-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>JWT Secure Gateway</span>
        </div>
      </div>

      {/* Center Sign In Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-[#181615] rounded-[32px] border border-stone-800/80 p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow-xl shadow-amber-950/50">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-stone-900 flex items-center justify-center">
                {cafe?.logo ? (
                  <img src={cafe.logo} alt={cafe.name} className="w-full h-full object-cover" />
                ) : (
                  <Coffee className="w-7 h-7 text-amber-400" />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Staff Administration
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                {cafe?.name || 'Cafe QR Management'} • Route <code className="text-amber-400">/admin</code>
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-400">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cafemanue@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#11100f] rounded-2xl border border-stone-800 focus:border-amber-600 outline-none text-xs text-white placeholder-stone-600 font-medium transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-400">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Cafemanue@2062"
                  className="w-full pl-10 pr-10 py-3 bg-[#11100f] rounded-2xl border border-stone-800 focus:border-amber-600 outline-none text-xs text-white placeholder-stone-600 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm shadow-xl shadow-amber-950/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In (JWT Token)</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div className="pt-2 border-t border-stone-800/60 text-center space-y-2">
            <div>
              <p className="text-[11px] text-stone-400">
                Admin Email: <span className="text-stone-300 font-mono font-semibold">cafemanue@gmail.com</span>
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Password: <span className="text-stone-300 font-mono font-semibold">Cafemanue@2062</span>
              </p>
            </div>

            {onGoToStaff && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onGoToStaff}
                  className="text-xs font-bold text-amber-500 hover:text-amber-400 cursor-pointer transition-colors"
                >
                  Staff Member? Log in at /staff &rarr;
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-stone-600 py-2">
        JWT authentication active with 7-day cryptographically signed sessions
      </div>

    </div>
  );
};
