import axios from 'axios';

/** Pulls a human-readable message from typical Express / Mongoose / JWT error bodies. */
export function parseApiErrorMessage(err: unknown): string | null {
  if (!axios.isAxiosError(err) || err.response == null) return null;
  const { data, status } = err.response;

  if (typeof data === 'string') {
    const t = data.trim();
    if (!t) return null;
    if (t.startsWith('<!') || t.startsWith('<html')) {
      return status >= 500
        ? 'Server error. Check the backend terminal.'
        : `Request failed (${status}).`;
    }
    return t;
  }

  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message) return o.message;
    if (typeof o.error === 'string' && o.error) return o.error;
    if (o.errors && typeof o.errors === 'object') {
      const errs = o.errors as Record<string, { message?: string } | undefined>;
      for (const v of Object.values(errs)) {
        if (v && typeof v.message === 'string') return v.message;
      }
    }
  }

  return null;
}

/** When there is no HTTP response (API down, CORS, wrong URL). */
export function networkErrorHint(err: unknown): string | null {
  if (!axios.isAxiosError(err)) return null;
  if (err.response != null) return null;
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'Cannot reach the API. From the project root run npm run api so the backend listens on port 5000, then try again.';
  }
  if (err.code === 'ECONNABORTED') {
    return 'Request timed out. Check your connection and that the API is running.';
  }
  return 'Cannot reach the API. Start the backend (npm run api) on port 5000.';
}
