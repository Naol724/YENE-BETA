/** Passed via React Router `location.state` for post–sign-in / sign-up navigation. */
export type AuthLocationState = {
  /** Preferred destination after successful login or “Continue to app” on register (e.g. `/inquiries`). */
  redirectTo?: string;
  from?: { pathname?: string };
};

export function getPostAuthRedirectPath(state: unknown): string | undefined {
  if (!state || typeof state !== 'object') return undefined;
  const s = state as AuthLocationState;
  if (typeof s.redirectTo === 'string' && s.redirectTo.startsWith('/')) {
    return s.redirectTo;
  }
  const p = s.from?.pathname;
  if (typeof p === 'string' && p.startsWith('/')) {
    return p;
  }
  return undefined;
}

/** State to open Register/Login from “Contact owner” so users land on Messages after auth. */
export const CONTACT_OWNER_AUTH_STATE: AuthLocationState = {
  redirectTo: '/inquiries',
};
