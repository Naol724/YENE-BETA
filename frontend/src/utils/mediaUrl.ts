import { getApiBaseUrl, getSocketOrigin } from './api';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

/**
 * Turn API-relative, absolute, or stale localhost upload URLs into a browser-loadable src.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (url == null) return PLACEHOLDER;
  let raw = String(url).trim();
  if (!raw) return PLACEHOLDER;

  // Collapse accidental whitespace inside data URLs from DB/API dumps
  if (raw.startsWith('data:')) {
    return raw.replace(/\s+/g, '');
  }

  if (raw.startsWith('blob:') || raw.includes('images.unsplash.com')) {
    return raw;
  }

  try {
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      const path = parsed.pathname || '';
      // Always pin local upload URLs to the current API origin (port may change).
      if (
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
        (path.startsWith('/uploads/') || path.includes('/uploads/properties/'))
      ) {
        return `${getSocketOrigin()}${path}${parsed.search}`;
      }
      return raw;
    }
  } catch {
    /* fall through */
  }

  // Relative upload path
  if (raw.startsWith('/uploads/') || raw.startsWith('uploads/')) {
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${getSocketOrigin()}${path}`;
  }

  // Filename only (legacy)
  if (/^property_[\w.-]+\.(jpe?g|png|webp|gif)$/i.test(raw)) {
    return `${getSocketOrigin()}/uploads/properties/${raw}`;
  }

  if (raw.startsWith('/')) {
    try {
      return new URL(raw, getApiBaseUrl().replace(/\/api\/?$/, '/')).href;
    } catch {
      return raw;
    }
  }

  return raw;
}

export { PLACEHOLDER as MEDIA_PLACEHOLDER };
