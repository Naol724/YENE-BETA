/** Basic email check for client-side forms (server still validates). */
export function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Ethiopia-style phone: optional +251 and digits/spaces, min length */
export function isValidPhoneLoose(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9;
}
