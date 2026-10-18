import { CountryCode, getCountries, getCountryCallingCode } from 'libphonenumber-js';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function getCountryFlag(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function getCountryName(countryCode: string): string {
  try {
    return regionNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

// Complete sorted list of all 245 countries supported by libphonenumber-js
export const ALL_COUNTRIES: CountryInfo[] = getCountries()
  .map(code => {
    let callingCode = '+';
    try {
      callingCode = '+' + getCountryCallingCode(code);
    } catch {
      callingCode = '';
    }
    return {
      code,
      name: getCountryName(code),
      callingCode,
      flag: getCountryFlag(code)
    };
  })
  .filter(c => c.callingCode !== '+')
  .sort((a, b) => a.name.localeCompare(b.name));

// Default country: India (+91) per specification
export const DEFAULT_COUNTRY: CountryInfo = ALL_COUNTRIES.find(c => c.code === 'IN') || {
  code: 'IN',
  name: 'India',
  callingCode: '+91',
  flag: '🇮🇳'
};

// Popular countries pinned at top for fast mobile access
export const POPULAR_COUNTRY_CODES: CountryCode[] = ['IN', 'US', 'GB', 'AE', 'DE', 'SG', 'JP', 'AU', 'CA', 'FR', 'IT'];

export const POPULAR_COUNTRIES: CountryInfo[] = POPULAR_COUNTRY_CODES
  .map(code => ALL_COUNTRIES.find(c => c.code === code))
  .filter((c): c is CountryInfo => Boolean(c));
