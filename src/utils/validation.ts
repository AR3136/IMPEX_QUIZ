export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  designation?: string;
  city?: string;
  visitorType?: string;
  consent: boolean;
}

/**
 * Validate full name (minimum 2 letters, letters, spaces, hyphens, periods).
 */
export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Full name is required';
  }
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (trimmed.length > 70) {
    return 'Name cannot exceed 70 characters';
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return 'Name can only contain letters, spaces, hyphens, and dots';
  }
  return null;
}

/**
 * Validate email address format.
 */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required';
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@company.com)';
  }
  return null;
}

/**
 * Validate mobile number:
 * - Supports standard 10-digit Indian numbers (starting with 6-9)
 * - Supports Indian numbers with country code: +91, 091, 91
 * - Supports international numbers with country codes: e.g. +1, +44, +49, +81, +971 etc.
 */
export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return 'Mobile number is required';
  }

  // Strip common separators (spaces, hyphens, brackets)
  const cleanPhone = trimmed.replace(/[\s\-()]/g, '');

  // 1. Standard 10-digit Indian Mobile: starts with 6, 7, 8, 9
  if (/^[6-9]\d{9}$/.test(cleanPhone)) {
    return null;
  }

  // 2. Indian Mobile with +91 or 0 prefix: +919876543210, 09876543210
  if (/^(\+?91|0)[6-9]\d{9}$/.test(cleanPhone)) {
    return null;
  }

  // 3. International Mobile: starts with '+' followed by 1-4 digit country code and 7-12 digits
  if (/^\+\d{1,4}\d{7,12}$/.test(cleanPhone)) {
    return null;
  }

  return 'Enter a valid 10-digit mobile number (or with country code, e.g. +91 98765 43210)';
}

/**
 * Validate registration form data.
 */
export function validateRegistrationForm(data: RegistrationFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (!data.consent) {
    errors.consent = 'Please accept the privacy consent to participate in the quiz';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generate a unique exhibition submission ID.
 * Format: IMTEX-YYYYMMDD-XXXX (e.g. IMTEX-20261017-K9F2)
 */
export function generateSubmissionId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IMTEX-${dateStr}-${randomChars}`;
}
