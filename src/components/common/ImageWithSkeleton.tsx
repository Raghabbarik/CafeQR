import React, { useState, useEffect } from 'react';
import { Coffee, UtensilsCrossed } from 'lucide-react';

const DEFAULT_FOOD_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 400' width='500' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fbf8f3'/%3E%3Cstop offset='100%25' stop-color='%23ece4d5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ccircle cx='250' cy='175' r='75' fill='%23dfd5c2' stroke='%23cbbeaa' stroke-width='3'/%3E%3Cpath d='M215 165c10-25 60-25 70 0M210 185c15-10 65-10 80 0M225 205c12 6 38 6 50 0' stroke='%23854d0e' stroke-width='6' stroke-linecap='round' fill='none'/%3E%3Ctext x='250' y='295' text-anchor='middle' font-family='system-ui, sans-serif' font-weight='800' font-size='17' fill='%2378350f'%3EThe Roasted Bean Cafe%3C/text%3E%3C/svg%3E";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  fallbackSrc?: string;
  showIconPlaceholder?: boolean;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt = 'Cafe Item',
  className = '',
  containerClassName = '',
  fallbackSrc,
  showIconPlaceholder = true,
  ...props
}) => {
  const isBase64 = Boolean(src && src.startsWith('data:image'));
  const [isLoaded, setIsLoaded] = useState<boolean>(isBase64);
  const [attempt, setAttempt] = useState<number>(0);
  const [hasFailedCompletely, setHasFailedCompletely] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src || DEFAULT_FOOD_SVG);

  useEffect(() => {
    setAttempt(0);
    setHasFailedCompletely(false);
    if (src && src.startsWith('data:image')) {
      setCurrentSrc(src);
      setIsLoaded(true);
    } else if (src) {
      setCurrentSrc(src);
      setIsLoaded(false);
    } else {
      setCurrentSrc(fallbackSrc || DEFAULT_FOOD_SVG);
      setIsLoaded(true);
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasFailedCompletely(false);
  };

  const handleError = () => {
    if (attempt === 0 && src && src.startsWith('http') && !src.includes('images.weserv.nl')) {
      // Attempt 1: Route through high-speed CDN proxy to bypass ISP / hotlinking blocks
      setAttempt(1);
      const cleanUrl = src.replace(/^https?:\/\//, '');
      setCurrentSrc(`https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}`);
    } else if (attempt <= 1 && fallbackSrc && currentSrc !== fallbackSrc) {
      // Attempt 2: Try explicit fallbackSrc if provided
      setAttempt(2);
      setCurrentSrc(fallbackSrc);
    } else {
      // Failed: Immediately show custom stylized fallback UI - NEVER native browser broken image icon
      setIsLoaded(true);
      setHasFailedCompletely(true);
    }
  };

  if (hasFailedCompletely) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-amber-50 to-stone-100 flex flex-col items-center justify-center p-3 text-center ${containerClassName}`}>
        <UtensilsCrossed className="w-8 h-8 text-amber-700/60 mb-1 animate-pulse" />
        <span className="text-[10px] font-bold text-stone-600 line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton Pulse Loader */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 bg-stone-200/80 animate-pulse flex items-center justify-center">
          {showIconPlaceholder && (
            <div className="flex flex-col items-center justify-center text-stone-400">
              <Coffee className="w-5 h-5 animate-bounce opacity-60" />
            </div>
          )}
        </div>
      )}

      {/* Target Image with no-referrer protection */}
      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="no-referrer"
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

