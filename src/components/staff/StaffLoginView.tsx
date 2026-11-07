import React, { useState } from 'react';
import type { CafeInfo, StaffMember } from '../../types';
import { api } from '../../services/api';
import {
  Coffee,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface StaffLoginViewProps {
  cafe: CafeInfo;
  onLoginSuccess: (staff: StaffMember) => void;
  onExitToCustomer: () => void;
  onGoToAdmin?: () => void;
}

export const StaffLoginView: React.FC<StaffLoginViewProps> = ({
  cafe,
  onLoginSuccess,
  onExitToCustomer,
  onGoToAdmin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your staff email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.loginStaff({
        email: email.trim(),
        password: password.trim(),
      });

      if (res && res.success && res.staff) {
        onLoginSuccess(res.staff);
      } else {
        setError('Login failed. Please check credentials assigned by Admin.');
      }
    } catch (err: any) {
      console.error('Staff login error:', err);
      setError(err.message || 'Invalid email or password. Please verify with Cafe Admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0d0c] text-stone-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden select-none antialiased">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={onExitToCustomer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Customer Menu</span>
        </button>

        {onGoToAdmin && (
          <button
            onClick={onGoToAdmin}
            className="text-xs font-bold text-amber-500/80 hover:text-amber-400 transition-colors cursor-pointer"
          >
            Admin Sign In →
          </button>
        )}
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-stone-900/90 backdrop-blur-xl border border-stone-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          
          {/* Cafe Logo & Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 p-0.5 shadow-xl shadow-amber-950/50">
              <div className="w-full h-full rounded-[14px] bg-stone-950 flex items-center justify-center overflow-hidden">
                {cafe.logo ? (
                  <img src={cafe.logo} alt={cafe.name} className="w-full h-full object-cover" />
                ) : (
                  <Coffee className="w-8 h-8 text-amber-400" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                <UtensilsCrossed className="w-3 h-3" />
                <span>Staff Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Staff Sign In
              </h1>
              <p className="text-xs text-stone-400">
                Sign in to manage Live Kitchen Orders and Menu availability
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@cafe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm font-medium transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-300">
                Staff Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm font-medium transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-sm tracking-wide shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Kitchen</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Role Notice */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 flex items-start gap-2.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Staff accounts are created by your Cafe Admin. Staff members can accept and update kitchen orders and manage item stock availability.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-[11px] text-stone-600">
        &copy; {new Date().getFullYear()} {cafe.name} &bull; Powered by CafeQR Staff Gateway
      </footer>

    </div>
  );
};

