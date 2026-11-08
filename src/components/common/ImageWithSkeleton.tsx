import React, { useState, useEffect } from 'react';
import { Coffee } from 'lucide-react';

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
  fallbackSrc = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  showIconPlaceholder = true,
  ...props
}) => {
  const isBase64 = Boolean(src && src.startsWith('data:image'));
  const [isLoaded, setIsLoaded] = useState<boolean>(isBase64);
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setCurrentSrc(src);
    if (src && src.startsWith('data:image')) {
      setIsLoaded(true);
      setHasError(false);
    } else {
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      setIsLoaded(true);
      setHasError(true);
    }
  };

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

      {/* Target Image */}
      <img
        src={currentSrc || fallbackSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

