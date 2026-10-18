import React, { useState } from 'react';
import { CountryCode } from 'libphonenumber-js';
import { useQuiz } from '../context/QuizContext';
import { validateName, validatePhone } from '../utils/validation';
import { normalizePhoneNumber } from '../utils/phone';
import { PhoneInput } from '../components/PhoneInput';
import {
  User,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const { startQuiz, isLoading, error: serverError } = useQuiz();

  // Minimal form state: Full Name & Mobile Number (Unique Entry ID)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryCode>('IN');
  const [normalizedE164, setNormalizedE164] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  // Field change handlers with live error clearing
  const handleNameChange = (val: string) => {
    setName(val);
    if (touched.name) {
      const err = validateName(val);
      setValidationErrors(prev => {
        const next = { ...prev };
        if (err) next.name = err;
        else delete next.name;
        return next;
      });
    }
  };

  const handlePhoneChange = (nationalNumber: string, fullE164: string, newCountry: CountryCode) => {
    setPhone(nationalNumber);
    setNormalizedE164(fullE164);
    setCountry(newCountry);

    if (touched.phone) {
      const err = validatePhone(nationalNumber, newCountry);
      setValidationErrors(prev => {
        const next = { ...prev };
        if (err) next.phone = err;
        else delete next.phone;
        return next;
      });
    }
  };

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry);
    if (touched.phone) {
      const err = validatePhone(phone, newCountry);
      setValidationErrors(prev => {
        const next = { ...prev };
        if (err) next.phone = err;
        else delete next.phone;
        return next;
      });
    }
  };

  const handleBlur = (field: 'name' | 'phone') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let err: string | null = null;
    if (field === 'name') err = validateName(name);
    if (field === 'phone') err = validatePhone(phone, country);

    setValidationErrors(prev => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || isSubmittingLocal) return;

    setTouched({ name: true, phone: true });

    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone, country);

    if (nameErr || phoneErr) {
      const errors: Record<string, string> = {};
      if (nameErr) errors.name = nameErr;
      if (phoneErr) errors.phone = phoneErr;
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmittingLocal(true);
      const phoneNorm = normalizePhoneNumber(phone, country);
      const canonicalPhone = phoneNorm.isValid ? phoneNorm.normalized : normalizedE164 || phone.trim();

      await startQuiz({
        name: name.trim(),
        phone: canonicalPhone,
        country
      });
    } catch {
      // Server error is handled via QuizContext and displayed in the alert below
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const isFormBusy = isLoading || isSubmittingLocal;

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-4 py-3 sm:py-5 max-w-md mx-auto space-y-4">
      {/* 1. Welcome Message & Exhibition Invitation */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-imtex-card/90 border border-imtex-gold/50 text-imtex-gold text-xs sm:text-sm font-semibold shadow-glow-gold-sm">
          <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-imtex-gold" aria-hidden="true" />
          <span>IMTEX 2026 / 2027 Challenge</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight leading-snug">
          Welcome to the{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-imtex-goldLight via-imtex-gold to-imtex-goldHover">
            Manufacturing Quiz
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#D9E0E1] leading-relaxed max-w-sm mx-auto">
          Test your engineering and machining knowledge in this fast 10-question challenge. Complete the quiz and collect your exclusive gift hamper at{' '}
          <strong className="text-imtex-gold font-bold">Booth A161 (Hall 4)</strong>!
        </p>
      </div>

      {/* 2. Minimal Registration Form Container */}
      <form onSubmit={handleSubmit} noValidate className="glass-panel rounded-2xl p-4 sm:p-6 shadow-card-dark border border-imtex-gold/30 space-y-4">
        {/* Server Alert Message (polite duplicate explanation or connection issue) */}
        {serverError && (
          <div
            role="alert"
            className="bg-amber-950/90 border border-imtex-gold text-amber-100 text-sm p-3.5 rounded-xl flex items-start space-x-2.5 leading-relaxed shadow-lg animate-fadeIn"
          >
            <AlertCircle className="w-5 h-5 text-imtex-gold shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <strong className="block text-imtex-gold font-bold mb-0.5">Participation Notice</strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* --- FIELD 1: Full Name --- */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="reg-name" className="text-sm sm:text-base font-bold text-[#F5F5F5] flex items-center space-x-1.5">
              <User className="w-4 h-4 text-imtex-gold" aria-hidden="true" />
              <span>Full Name</span>
              <span className="text-imtex-gold font-bold">*</span>
            </label>
          </div>

          <input
            id="reg-name"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. Rajesh Kumar"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            onBlur={() => handleBlur('name')}
            disabled={isFormBusy}
            aria-invalid={Boolean(validationErrors.name)}
            aria-describedby={validationErrors.name ? 'reg-name-error' : undefined}
            className={`w-full min-h-[50px] px-4 py-3 rounded-xl border bg-white text-[#202B2E] placeholder-slate-400 focus:outline-none transition-all text-base ${
              validationErrors.name
                ? 'border-red-500 focus:ring-2 focus:ring-red-400/50'
                : 'border-slate-300 focus:border-imtex-gold focus:ring-2 focus:ring-imtex-gold/40'
            }`}
          />

          {validationErrors.name && (
            <p id="reg-name-error" className="text-xs sm:text-sm text-red-400 mt-1.5 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{validationErrors.name}</span>
            </p>
          )}
        </div>

        {/* --- FIELD 2: Mobile Number (Unique Entry ID) --- */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="reg-phone" className="text-sm sm:text-base font-bold text-[#F5F5F5] flex items-center space-x-1.5">
              <Phone className="w-4 h-4 text-imtex-gold" aria-hidden="true" />
              <span>Mobile Number</span>
              <span className="text-imtex-gold font-bold">*</span>
            </label>
            <span className="text-xs text-[#D9E0E1]">Unique Quiz Entry ID</span>
          </div>

          <PhoneInput
            id="reg-phone"
            value={phone}
            country={country}
            onChange={handlePhoneChange}
            onCountryChange={handleCountryChange}
            onBlur={() => handleBlur('phone')}
            disabled={isFormBusy}
            hasError={Boolean(validationErrors.phone)}
            ariaDescribedBy={validationErrors.phone ? 'reg-phone-error' : 'reg-phone-hint'}
          />

          {validationErrors.phone ? (
            <p id="reg-phone-error" className="text-xs sm:text-sm text-red-400 mt-1.5 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{validationErrors.phone}</span>
            </p>
          ) : (
            <p id="reg-phone-hint" className="text-xs text-[#D9E0E1] mt-1">
              1 attempt per mobile number. Used to claim your gift hamper at Booth A161 (Hall 4).
            </p>
          )}
        </div>

        {/* --- START CHALLENGE ACTION BUTTON (Golden yellow with dark text) --- */}
        <button
          type="submit"
          disabled={isFormBusy}
          className="w-full min-h-[54px] sm:min-h-[58px] py-3.5 px-5 rounded-xl font-black text-[#202B2E] bg-imtex-gold hover:bg-imtex-goldHover active:bg-[#d4ad4f] shadow-glow-gold flex items-center justify-center space-x-2 transition-all touch-press disabled:opacity-50 text-base sm:text-lg cursor-pointer"
        >
          {isFormBusy ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-[#202B2E] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <span>Checking Details & Preparing Quiz...</span>
            </div>
          ) : (
            <>
              <span>Start Challenge (10 Qs)</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* 3. Quick Highlights Footer */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm text-[#D9E0E1]">
        <div className="bg-imtex-card/80 p-2 sm:p-2.5 rounded-xl border border-imtex-gold/25">
          <span className="block font-bold text-imtex-gold">⏱️ ~2 Mins</span>
          <span className="block text-[#D9E0E1]/80">10 Questions</span>
        </div>
        <div className="bg-imtex-card/80 p-2 sm:p-2.5 rounded-xl border border-imtex-gold/25">
          <span className="block font-bold text-imtex-gold">🎁 Gift Hamper</span>
          <span className="block text-[#D9E0E1]/80">Booth A161</span>
        </div>
        <div className="bg-imtex-card/80 p-2 sm:p-2.5 rounded-xl border border-imtex-gold/25">
          <span className="block font-bold text-imtex-gold">📜 Official Pass</span>
          <span className="block text-[#D9E0E1]/80">IMTEX Souvenir</span>
        </div>
      </div>
    </div>
  );
};
