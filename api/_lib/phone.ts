export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

/**
 * Authoritative phone normalizer and validator.
 * 
 * Supports:
 * - Standard 10-digit Indian mobile numbers (starts with 6, 7, 8, 9)
 * - Indian mobile numbers with prefixes (+91, 91, 0)
 * - Formatted numbers with spaces, dashes, parentheses
 * - International E.164 numbers (+ followed by country code and 7-14 digits)
 * 
 * Returns canonical E.164 format:
 * - India: +91XXXXXXXXXX
 * - International: +[country_code][digits]
 */
export function normalizePhoneNumber(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      error: 'Mobile number is required.'
    };
  }

  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalized: '',
      error: 'Mobile number cannot be empty.'
    };
  }

  // Strip common formatting symbols: spaces, hyphens, brackets, dots
  const cleaned = trimmed.replace(/[\s\-\(\)\.]+/g, '');

  // 1. Indian number with +91 prefix: +91[6-9]XXXXXXXXX (13 chars)
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  // 2. Indian number with 91 prefix without '+': 91[6-9]XXXXXXXXX (12 digits)
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: true, normalized: `+${cleaned}` };
  }

  // 3. Indian number with leading 0: 0[6-9]XXXXXXXXX (11 digits)
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: true, normalized: `+91${cleaned.slice(1)}` };
  }

  // 4. Standard 10-digit Indian mobile: [6-9]XXXXXXXXX (10 digits)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: true, normalized: `+91${cleaned}` };
  }

  // 5. Valid International E.164 number: starts with + and 8-15 digits
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  return {
    isValid: false,
    normalized: '',
    error: 'Please enter a valid 10-digit mobile number (e.g. 98765 43210).'
  };
}
