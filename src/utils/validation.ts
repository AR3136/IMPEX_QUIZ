import { normalizePhoneNumber } from './phone';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface RegistrationFormData {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  designation?: string;
  city?: string;
  visitorType?: string;
  consent?: boolean;
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
 * Validate email address format (if provided).
 */
export function validateEmail(email?: string): string | null {
  if (!email || !email.trim()) {
    return null; // Email is optional per simplified registration requirements
  }
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@company.com)';
  }
  return null;
}

/**
 * Validate mobile number using canonical normalizer.
 */
export function validatePhone(phone: string): string | null {
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) {
    return norm.error || 'Please enter a valid 10-digit mobile number';
  }
  return null;
}

/**
 * Validate minimal registration form data (Name and Phone).
 * Consent checkbox and extra fields are eliminated per requirements.
 */
export function validateRegistrationForm(data: RegistrationFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (data.email) {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generate a unique exhibition submission ID.
 * Format: IMTEX-YYYYMMDD-XXXX (e.g. IMTEX-20261018-K9F2)
 */
export function generateSubmissionId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IMTEX-${dateStr}-${randomChars}`;
}
