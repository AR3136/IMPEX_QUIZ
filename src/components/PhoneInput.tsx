import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { ALL_COUNTRIES, POPULAR_COUNTRIES, CountryInfo, DEFAULT_COUNTRY } from '../utils/countries';
import { normalizePhoneNumber } from '../utils/phone';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface PhoneInputProps {
  id?: string;
  value: string;
  country: CountryCode;
  onChange: (nationalNumber: string, fullE164: string, country: CountryCode) => void;
  onCountryChange?: (newCountry: CountryCode) => void;
  onBlur?: () => void;
  disabled?: boolean;
  hasError?: boolean;
  ariaDescribedBy?: string;
}

function getPhonePlaceholder(countryCode: CountryCode): string {
  switch (countryCode) {
    case 'IN':
      return '98765 43210';
    case 'US':
    case 'CA':
      return '(415) 555-2671';
    case 'GB':
      return '7911 123456';
    case 'AE':
      return '50 123 4567';
    case 'SG':
      return '8123 4567';
    case 'AU':
      return '412 345 678';
    case 'DE':
      return '1512 3456789';
    case 'FR':
      return '6 12 34 56 78';
    case 'JP':
      return '90 1234 5678';
    default:
      return 'Enter mobile number';
  }
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id = 'reg-phone',
  value,
  country,
  onChange,
  onCountryChange,
  onBlur,
  disabled = false,
  hasError = false,
  ariaDescribedBy,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active country details
  const activeCountry = useMemo(() => {
    return ALL_COUNTRIES.find(c => c.code === country) || DEFAULT_COUNTRY;
  }, [country]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isModalOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Filter countries based on search query (by name, code, or calling code)
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(c => {
      const cleanCalling = c.callingCode.replace(/^\+/, '');
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        cleanCalling.includes(q)
      );
    });
  }, [searchQuery]);

  const handleSelectCountry = (newCountry: CountryInfo) => {
    setIsModalOpen(false);
    if (onCountryChange) {
      onCountryChange(newCountry.code);
    }
    // Re-evaluate current value with the new country code
    const norm = normalizePhoneNumber(value, newCountry.code);
    onChange(value, norm.isValid ? norm.normalized : '', newCountry.code);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Check if the user pasted or typed a full international number with + prefix
    if (rawInput.trim().startsWith('+')) {
      const parsed = parsePhoneNumberFromString(rawInput.trim());
      if (parsed && parsed.country && parsed.country !== country) {
        if (onCountryChange) onCountryChange(parsed.country);
        const norm = normalizePhoneNumber(rawInput, parsed.country);
        onChange(parsed.nationalNumber || rawInput, norm.isValid ? norm.normalized : '', parsed.country);
        return;
      }
    }

    const norm = normalizePhoneNumber(rawInput, country);
    onChange(rawInput, norm.isValid ? norm.normalized : '', country);
  };

  return (
    <div className="w-full">
      {/* Phone Input Control Group */}
      <div className="flex items-stretch rounded-xl border border-slate-300 focus-within:border-imtex-gold focus-within:ring-2 focus-within:ring-imtex-gold/40 bg-white transition-all overflow-hidden shadow-sm">
        {/* Country Selector Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsModalOpen(true)}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isModalOpen}
          aria-label={`Select country calling code. Currently ${activeCountry.name} (${activeCountry.callingCode})`}
          className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-r border-slate-200 text-[#202B2E] transition-colors cursor-pointer shrink-0 touch-press select-none"
        >
          <span className="text-xl leading-none" aria-hidden="true">
            {activeCountry.flag}
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-[#202B2E]">
            {activeCountry.callingCode}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>

        {/* National Number Input Field */}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel-national"
          placeholder={getPhonePlaceholder(country)}
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
          className="flex-1 min-h-[50px] px-3.5 py-3 text-base font-mono text-[#202B2E] placeholder-slate-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Accessible Searchable Country Dropdown Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select Country and Calling Code"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] bg-imtex-card border border-imtex-gold/40 rounded-t-2xl sm:rounded-2xl shadow-card-dark flex flex-col overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-imtex-gold/25 flex items-center justify-between bg-imtex-dark/80">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5]">
                  Select Country
                </h3>
                <p className="text-xs text-[#D9E0E1]">
                  Choose your country code for mobile verification
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close country selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="p-3 border-b border-imtex-gold/20 bg-imtex-card/90">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country name or code (e.g. India, +91, US)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-300 focus:border-imtex-gold rounded-xl pl-9 pr-3 py-2 text-sm text-[#202B2E] placeholder-slate-400 outline-none focus:ring-2 focus:ring-imtex-gold/40 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Country List Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
              {/* Pinned Popular Countries (shown when not actively searching) */}
              {!searchQuery && (
                <div className="pb-2">
                  <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-imtex-gold">
                    Popular Destinations
                  </div>
                  {POPULAR_COUNTRIES.map(c => {
                    const isSelected = c.code === country;
                    return (
                      <button
                        key={`pop-${c.code}`}
                        type="button"
                        onClick={() => handleSelectCountry(c)}
                        className={`w-full min-h-[48px] px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer touch-press ${
                          isSelected
                            ? 'bg-imtex-gold/20 text-[#F5F5F5] font-bold border border-imtex-gold/50'
                            : 'hover:bg-white/5 active:bg-white/10 text-[#F5F5F5]'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="text-2xl leading-none shrink-0" aria-hidden="true">
                            {c.flag}
                          </span>
                          <span className="text-sm sm:text-base font-medium truncate">
                            {c.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-mono text-xs sm:text-sm font-bold text-imtex-gold bg-imtex-dark px-2 py-0.5 rounded border border-imtex-gold/30">
                            {c.callingCode}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-imtex-gold" />}
                        </div>
                      </button>
                    );
                  })}
                  <div className="my-2 border-t border-imtex-gold/20" />
                  <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
                    All Countries ({ALL_COUNTRIES.length})
                  </div>
                </div>
              )}

              {/* Filtered Results */}
              {filteredCountries.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#D9E0E1]">
                  No countries matching "{searchQuery}"
                </div>
              ) : (
                filteredCountries.map(c => {
                  const isSelected = c.code === country;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full min-h-[48px] px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer touch-press ${
                        isSelected
                          ? 'bg-imtex-gold/20 text-[#F5F5F5] font-bold border border-imtex-gold/50'
                          : 'hover:bg-white/5 active:bg-white/10 text-[#F5F5F5]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-2xl leading-none shrink-0" aria-hidden="true">
                          {c.flag}
                        </span>
                        <span className="text-sm sm:text-base font-medium truncate">
                          {c.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-mono text-xs sm:text-sm font-bold text-imtex-gold bg-imtex-dark px-2 py-0.5 rounded border border-imtex-gold/30">
                          {c.callingCode}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-imtex-gold" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-imtex-gold/20 bg-imtex-dark/90 text-center">
              <span className="text-xs text-[#D9E0E1]">
                Tap anywhere outside or press Esc to cancel
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
