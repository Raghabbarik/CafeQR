import React, { useState, useEffect } from 'react';
import { Coffee, Sparkles, ArrowRight } from 'lucide-react';

interface GlassmorphismLoaderProps {
  cafeName?: string;
  cafeLogo?: string;
  onSkip?: () => void;
}

export const GlassmorphismLoader: React.FC<GlassmorphismLoaderProps> = ({
  cafeName = 'Cafe Date Corner (CDC)',
  cafeLogo,
  onSkip,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusText = () => {
    if (seconds < 3) return 'Connecting to cafe cloud...';
    if (seconds < 8) return 'Waking up secure server & live kitchen...';
    if (seconds < 15) return 'Syncing fresh menu, prices & specials...';
    return 'Almost ready! Finalizing connection...';
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none animate-in fade-in duration-500"
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(30, 20, 15, 0.75), rgba(10, 8, 7, 0.92))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Ambient background glow orbs for glassmorphism lighting */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-amber-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphism Frosted Card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-7 text-center flex flex-col items-center space-y-4 overflow-hidden border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        {/* Subtle animated light sheen across glass */}
        <div
          className="absolute -inset-full w-[200%] h-[200%] pointer-events-none opacity-20"
          style={{
            background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
            animation: 'glass-sheen 3.5s infinite linear',
          }}
        />

        {/* Cafe Logo or Coffee Cup with Glowing Spinning Ring */}
        <div className="relative w-22 h-22 flex items-center justify-center my-1">
          {/* Outer spinning gradient ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-200/80 animate-spin"
            style={{ animationDuration: '1.2s' }}
          />

          {/* Soft inner glow */}
          <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-200/20 blur-xs" />

          {/* Logo container */}
          <div className="relative w-18 h-18 rounded-full p-1 bg-white/20 backdrop-blur-md border border-white/40 shadow-inner overflow-hidden flex items-center justify-center">
            {cafeLogo ? (
              <img
                src={cafeLogo}
                alt={cafeName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-amber-900/60 flex items-center justify-center text-amber-200">
                <Coffee className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Cafe Name & Heading */}
        <div className="space-y-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-300 drop-shadow-sm flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>{cafeName}</span>
          </p>
          <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">
            Warming Up Kitchen...
          </h3>
        </div>

        {/* Dynamic Status Message */}
        <p className="text-xs text-stone-200/90 font-medium max-w-[260px] min-h-[32px] flex items-center justify-center leading-relaxed">
          {getStatusText()}
        </p>

        {/* Animated Pill Progress Dots */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-amber-200 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Quick Skip Button if server wake-up takes more than 3 seconds */}
        {seconds >= 3 && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/30 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer backdrop-blur-md"
          >
            <span>Explore Menu Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        )}
      </div>

      {/* Global Glass Sheen Keyframes */}
      <style>{`
        @keyframes glass-sheen {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(50%, 50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
