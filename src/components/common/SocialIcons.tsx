import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Authentic Google 4-Color 'G' Logo
 */
export const GoogleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

/**
 * Authentic Instagram Logo with Official Vibrant Gradient & White Camera Glyph
 */
export const InstagramIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="real-instagram-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6.5" fill="url(#real-instagram-grad)" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#ffffff" strokeWidth="1.6" fill="none" />
    <circle cx="12" cy="12" r="3.2" stroke="#ffffff" strokeWidth="1.6" fill="none" />
    <circle cx="15.8" cy="8.2" r="0.9" fill="#ffffff" />
  </svg>
);

/**
 * Authentic WhatsApp Logo with #25D366 Green Bubble & White Handset
 */
export const WhatsAppIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      fill="#FFFFFF"
      d="M12.012 3.84c-4.506 0-8.172 3.666-8.172 8.172 0 1.44.378 2.844 1.092 4.086l-1.164 4.248 4.356-1.14c1.194.654 2.538 1 3.888 1 4.506 0 8.172-3.666 8.172-8.172 0-4.506-3.666-8.172-8.172-8.172zm4.77 11.55c-.198.558-.996 1.026-1.428 1.068-.396.036-.912.066-2.928-.768-2.424-1.002-3.996-3.48-4.116-3.642-.12-.162-.978-1.302-.978-2.484 0-1.182.618-1.764.84-2.004.222-.24.48-.3.642-.3.162 0 .324 0 .468.006.15.006.348-.06.546.414.204.492.696 1.698.756 1.818.06.12.102.264.018.426-.078.162-.12.264-.24.402-.12.144-.252.318-.36.426-.12.12-.246.252-.108.492.138.24.618 1.02 1.326 1.65.912.81 1.68 1.062 1.92 1.182.24.12.378.102.516-.06.144-.162.618-.72.78-.966.162-.246.324-.204.546-.12.222.078 1.41.666 1.65.786.24.12.396.18.456.282.06.102.06.588-.138 1.146z"
    />
  </svg>
);

/**
 * Authentic Facebook Logo with #1877F2 Blue Circle & White Bold 'f'
 */
export const FacebookIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      fill="#FFFFFF"
      d="M15.117 12.723l.412-2.684h-2.576V8.295c0-.735.36-1.452 1.515-1.452h1.172V4.557c-.647-.09-1.3-.135-1.954-.135-1.993 0-3.293 1.209-3.293 3.393v2.224H8.05v2.684h2.343V20.25a12.08 12.08 0 0 0 3.737 0v-7.527h1.987z"
    />
  </svg>
);

/**
 * Authentic YouTube Logo with #FF0000 Red Badge & White Play Glyph
 */
export const YouTubeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#FF0000" />
    <path fill="#FFFFFF" d="M10 8.5l5.5 3.5-5.5 3.5v-7z" />
  </svg>
);

/**
 * Authentic X Logo with #000000 Black Badge & White X Mark
 */
export const TwitterXIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#000000" />
    <path
      fill="#FFFFFF"
      d="M17.16 5.5h2.15l-4.7 5.37L20.14 18.5h-4.32l-3.39-4.43-3.87 4.43H6.41l5.03-5.75L6 5.5h4.43l3.07 4.06 3.66-4.06zm-.76 11.71h1.19L9.93 6.72H8.65l7.75 10.49z"
    />
  </svg>
);
