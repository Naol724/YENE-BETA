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

  const configured =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
      ? String(import.meta.env.VITE_API_URL).trim()
      : '';
  const target = configured || 'http://localhost:5000/api (fallback)';
  const isLocalTarget = /localhost|127\.0\.0\.1/i.test(target);

  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    if (isLocalTarget) {
      return (
        `Cannot reach the API at ${target}. On Vercel set VITE_API_URL to your Render URL ending in /api ` +
        `(example: https://your-api.onrender.com/api), then Redeploy. Also set FRONTEND_URL on Render to your Vercel site URL.`
      );
    }
    return (
      `Cannot reach the API at ${target}. Open that URL + /health in a browser (should return JSON). ` +
      `If it works, check Render FRONTEND_URL matches your Vercel origin exactly (CORS).`
    );
  }
  if (err.code === 'ECONNABORTED') {
    return `Request timed out talking to ${target}. Free Render apps sleep — wait ~30s and try again.`;
  }
  return `Cannot reach the API at ${target}. Check VITE_API_URL on Vercel and FRONTEND_URL on Render.`;
}
