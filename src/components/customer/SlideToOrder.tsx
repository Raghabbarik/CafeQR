import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface SlideToOrderProps {
  label?: string;
  onComplete: () => void;
  disabled?: boolean;
}

export const SlideToOrder: React.FC<SlideToOrderProps> = ({
  label = 'Order Now',
  onComplete,
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  
  const [dragX, setDragX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [maxDrag, setMaxDrag] = useState<number>(200);

  // Compute max drag distance when component mounts or resizes
  const updateMaxDrag = useCallback(() => {
    if (trackRef.current && handleRef.current) {
      const trackWidth = trackRef.current.clientWidth;
      const handleWidth = handleRef.current.clientWidth;
      const padding = 6; // 6px padding on each side
      const calculatedMax = Math.max(0, trackWidth - handleWidth - padding * 2);
      setMaxDrag(calculatedMax);
    }
  }, []);

  useEffect(() => {
    updateMaxDrag();
    window.addEventListener('resize', updateMaxDrag);
    return () => window.removeEventListener('resize', updateMaxDrag);
  }, [updateMaxDrag]);

  const startDragXRef = useRef<number>(0);
  const currentDragXRef = useRef<number>(0);

  const triggerCompletion = useCallback(() => {
    setIsCompleted(true);
    setDragX(maxDrag);
    // Haptic vibration on mobile if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
    setTimeout(() => {
      onComplete();
    }, 320);
  }, [maxDrag, onComplete]);

  // Touch event handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isCompleted) return;
    setIsDragging(true);
    startDragXRef.current = e.touches[0].clientX - dragX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled || isCompleted) return;
    const clientX = e.touches[0].clientX;
    const newX = Math.max(0, Math.min(clientX - startDragXRef.current, maxDrag));
    currentDragXRef.current = newX;
    setDragX(newX);

    // If dragged past 85% of distance, snap to complete
    if (newX >= maxDrag * 0.85) {
      setIsDragging(false);
      triggerCompletion();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || isCompleted) return;
    setIsDragging(false);
    if (currentDragXRef.current >= maxDrag * 0.75) {
      triggerCompletion();
    } else {
      // Spring back to 0
      setDragX(0);
      currentDragXRef.current = 0;
    }
  };

  // Mouse drag event handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isCompleted) return;
    setIsDragging(true);
    startDragXRef.current = e.clientX - dragX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const clientX = moveEvent.clientX;
      const newX = Math.max(0, Math.min(clientX - startDragXRef.current, maxDrag));
      currentDragXRef.current = newX;
      setDragX(newX);

      if (newX >= maxDrag * 0.85) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        setIsDragging(false);
        triggerCompletion();
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);
      if (currentDragXRef.current >= maxDrag * 0.75) {
        triggerCompletion();
      } else {
        setDragX(0);
        currentDragXRef.current = 0;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Click on track: smooth auto-slide to unlock
  const handleTrackClick = () => {
    if (isCompleted || disabled) return;
    // If user clicked the right side or just tapped the button, animate slide
    setIsDragging(false);
    setDragX(maxDrag);
    triggerCompletion();
  };

  const progressPercent = maxDrag > 0 ? (dragX / maxDrag) * 100 : 0;

  return (
    <div className="w-full select-none touch-none">
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-full h-[62px] sm:h-[66px] bg-[#111111] hover:bg-black rounded-full p-1.5 flex items-center shadow-xl shadow-black/25 overflow-hidden border border-white/10 cursor-pointer"
      >
        {/* Fill Track Background Progress */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 rounded-full transition-all duration-75"
          style={{
            width: `calc(${dragX}px + 56px)`,
            opacity: progressPercent > 5 ? 0.95 : 0,
          }}
        />

        {/* Track Label Text & Animated Chevrons */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-150 pl-8 pr-4"
          style={{
            opacity: isCompleted ? 0 : Math.max(0.15, 1 - (progressPercent / 60)),
          }}
        >
          <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base tracking-wide uppercase">
            <span>{label}</span>
            <div className="flex items-center text-white/50 text-xs animate-pulse">
              <span>›</span>
              <span>›</span>
              <span>›</span>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm sm:text-base tracking-wider animate-in fade-in zoom-in-95 duration-200">
            <span className="flex items-center gap-1.5 text-white">
              <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
              Opening Menu...
            </span>
          </div>
        )}

        {/* Draggable Circle Arrow Handle */}
        <div
          ref={handleRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className={`relative z-10 w-12 h-12 sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-grab active:cursor-grabbing transition-transform ${
            isCompleted
              ? 'bg-emerald-500 text-white scale-105'
              : 'bg-white text-stone-900 hover:scale-105'
          } ${!isDragging ? 'transition-all duration-300 ease-out' : ''}`}
          style={{
            transform: `translateX(${dragX}px)`,
          }}
        >
          {isCompleted ? (
            <Check className="w-5 h-5 text-white stroke-[3] animate-in zoom-in-75 duration-150" />
          ) : (
            <div className="flex items-center justify-center relative">
              <ArrowRight className="w-5 h-5 text-stone-950 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              {/* Subtle pulse ring on handle to prompt user to slide */}
              {!isDragging && (
                <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping pointer-events-none opacity-40" />
              )}
            </div>
          )}
        </div>

        {/* Instruction pill hint on left */}
        <div
          className="absolute right-4 text-[10px] font-bold text-white/40 uppercase tracking-widest pointer-events-none transition-opacity hidden sm:block"
          style={{ opacity: dragX > 20 ? 0 : 0.6 }}
        >
          Slide →
        </div>

      </div>
    </div>
  );
};