/**
 * Helper to clean and sanitize Google Maps embed URLs and iframe code.
 * Handles:
 * - Full HTML <iframe> embed code from Google Maps
 * - Embed URLs (https://www.google.com/maps/embed?pb=...)
 * - Query / Search URLs (https://maps.google.com/?q=...)
 * - Place URLs (https://www.google.com/maps/place/...)
 * - Raw address strings
 */
export function extractCleanMapEmbedUrl(input?: string, fallbackAddress?: string): string {
  if (!input || !input.trim()) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return 'https://maps.google.com/maps?q=Indiranagar%20Bengaluru&t=&z=14&ie=UTF8&iwloc=&output=embed';
  }

  const trimmed = input.trim();

  // 1. If user pasted a full <iframe ... src="..." ...> HTML snippet
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }

  // 2. If it's already an official Google Maps embed URL
  if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
    return trimmed;
  }

  // 3. If user pasted a Google Maps Place URL: https://www.google.com/maps/place/Name/@lat,long...
  const placeMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 4. If user pasted a Google Maps query URL: https://maps.google.com/?q=...
  if (trimmed.includes('google.com/maps') && (trimmed.includes('q=') || trimmed.includes('query='))) {
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}output=embed`;
  }

  // 5. If user pasted coordinates or raw query
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 6. If user pasted raw text address
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Clean directions / share URL (for opening in Google Maps app / browser)
 */
export function extractCleanDirectionsUrl(input?: string, fallbackAddress?: string): string {
  if (!input || !input.trim()) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/?q=${encodeURIComponent(fallbackAddress.trim())}`;
    }
    return 'https://maps.google.com/?q=Indiranagar+Bengaluru';
  }

  const trimmed = input.trim();

  // If user accidentally pasted iframe into directions
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://maps.google.com/?q=${encodeURIComponent(trimmed)}`;
}
