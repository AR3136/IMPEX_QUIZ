import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
export type { CountryCode };

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  formatted?: string;
  nationalNumber?: string;
  country?: CountryCode;
  countryCallingCode?: string;
  error?: string;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function getCountryName(countryCode: string): string {
  try {
    return regionNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

/**
 * Authoritative phone normalizer and validator using libphonenumber-js.
 * 
 * Supports:
 * - India (+91) with standard 10-digit mobile numbers, +91 prefix, 91 prefix, or leading 0.
 * - International numbers for all 245 countries using their national numbering plans.
 * - Normalizes to canonical E.164 format (+[countryCode][nationalNumber]) for safe storage and duplicate checks.
 */
export function normalizePhoneNumber(
  rawPhone: string,
  defaultCountry: CountryCode = 'IN'
): PhoneValidationResult {
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

  try {
    // If phone starts with + or 00, libphonenumber-js auto-identifies country from calling code.
    // Otherwise, defaultCountry (default: IN) provides the context for national number parsing.
    const phoneNumber = parsePhoneNumberFromString(trimmed, defaultCountry);

    if (!phoneNumber) {
      const countryName = getCountryName(defaultCountry);
      return {
        isValid: false,
        normalized: '',
        error: `Please enter a valid mobile number for ${countryName}.`
      };
    }

    if (!phoneNumber.isValid()) {
      const detectedCountry = phoneNumber.country || defaultCountry;
      const countryName = getCountryName(detectedCountry);
      const callingCode = phoneNumber.countryCallingCode ? ` (+${phoneNumber.countryCallingCode})` : '';
      return {
        isValid: false,
        normalized: '',
        error: `Please enter a valid mobile number for ${countryName}${callingCode}.`
      };
    }

    return {
      isValid: true,
      normalized: phoneNumber.format('E.164'),
      formatted: phoneNumber.formatInternational(),
      nationalNumber: phoneNumber.nationalNumber,
      country: phoneNumber.country,
      countryCallingCode: `+${phoneNumber.countryCallingCode}`
    };
  } catch {
    return {
      isValid: false,
      normalized: '',
      error: 'Invalid phone number format.'
    };
  }
}
