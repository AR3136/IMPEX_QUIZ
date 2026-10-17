import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { BrandingBanner } from '../components/BrandingBanner';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateRegistrationForm,
  RegistrationFormData,
} from '../utils/validation';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Gift,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const VISITOR_TYPES = [
  'Industry Professional',
  'Machine Tool Buyer / Sourcing',
  'Design & R&D Engineer',
  'Production & Quality Head',
  'Student / Academician',
  'Exhibitor / Partner',
];

export const RegistrationPage: React.FC = () => {
  const { startQuiz, isLoading, error: serverError } = useQuiz();

  // Form State - Personal info stays strictly local until submitted
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    city: '',
    visitorType: 'Industry Professional',
    consent: false, // Unchecked by default per requirement
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Field change handler with real-time error clearance
  const handleChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time re-validation if already touched
    if (touched[field]) {
      let err: string | null = null;
      if (field === 'name') err = validateName(value);
      if (field === 'email') err = validateEmail(value);
      if (field === 'phone') err = validatePhone(value);
      if (field === 'consent') err = value ? null : 'Consent is required to participate';

      setValidationErrors(prev => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: keyof RegistrationFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let err: string | null = null;
    if (field === 'name') err = validateName(formData.name);
    if (field === 'email') err = validateEmail(formData.email);
    if (field === 'phone') err = validatePhone(formData.phone);
    if (field === 'consent') err = formData.consent ? null : 'Consent is required to participate';

    setValidationErrors(prev => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  // Submit handler with strict validation and double-submission protection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent repeated simultaneous clicks
    if (isLoading || isSubmittingLocal) return;

    // Mark all fields touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      consent: true,
    });

    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      setIsSubmittingLocal(true);
      await startQuiz(formData);
    } catch {
      // Server error is handled via context and displayed below
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const isFormBusy = isLoading || isSubmittingLocal;

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-4 py-3 sm:py-4 max-w-md mx-auto">
      {/* 1. Official Exhibition & Partner Logos */}
      <BrandingBanner />

      {/* 2. Welcome Message & Exhibition Invitation */}
      <div className="text-center space-y-2 mb-3.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-glow-cyan">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>IMTEX 2026 / 2027 Challenge</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          Welcome to the{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-amber-400">
            Manufacturing Quiz
          </span>
        </h1>

        <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-sm mx-auto">
          Test your engineering and machining knowledge in this fast 10-question challenge. Complete the quiz and collect your exclusive gift hamper at{' '}
          <strong className="text-amber-400 font-bold">Booth A112 (Hall H1)</strong>!
        </p>
      </div>

      {/* 3. Registration Form Container */}
      <form onSubmit={handleSubmit} noValidate className="glass-panel rounded-2xl p-4 sm:p-5 shadow-card-dark space-y-3.5">
        {/* Server Error Alert */}
        {serverError && (
          <div className="bg-red-950/90 border border-red-500/60 text-red-200 text-xs p-3 rounded-xl flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{serverError}</span>
          </div>
        )}

        {/* --- MANDATORY FIELD 1: Full Name --- */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="reg-name" className="text-xs font-bold text-slate-200 flex items-center space-x-1">
              <span>Full Name</span>
              <span className="text-cyan-400 text-sm">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Mandatory</span>
          </div>
          <div className="relative">
            <User className={`w-4 h-4 absolute left-3 top-3.5 transition-colors ${
              validationErrors.name ? 'text-red-400' : touched.name && formData.name ? 'text-cyan-400' : 'text-slate-400'
            }`} />
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Vikram Sharma"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              disabled={isFormBusy}
              className={`w-full min-h-[48px] bg-slate-900/80 border rounded-xl pl-9 pr-9 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 transition-all outline-none ${
                validationErrors.name
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : touched.name && formData.name && !validationErrors.name
                  ? 'border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : 'border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
              }`}
            />
            {touched.name && formData.name && !validationErrors.name && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3.5" />
            )}
          </div>
          {validationErrors.name && (
            <p className="text-[11px] text-red-400 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{validationErrors.name}</span>
            </p>
          )}
        </div>

        {/* --- MANDATORY FIELD 2: Email Address --- */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="reg-email" className="text-xs font-bold text-slate-200 flex items-center space-x-1">
              <span>Email Address</span>
              <span className="text-cyan-400 text-sm">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Mandatory</span>
          </div>
          <div className="relative">
            <Mail className={`w-4 h-4 absolute left-3 top-3.5 transition-colors ${
              validationErrors.email ? 'text-red-400' : touched.email && formData.email ? 'text-cyan-400' : 'text-slate-400'
            }`} />
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={isFormBusy}
              className={`w-full min-h-[48px] bg-slate-900/80 border rounded-xl pl-9 pr-9 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 transition-all outline-none ${
                validationErrors.email
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : touched.email && formData.email && !validationErrors.email
                  ? 'border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : 'border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
              }`}
            />
            {touched.email && formData.email && !validationErrors.email && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3.5" />
            )}
          </div>
          {validationErrors.email && (
            <p className="text-[11px] text-red-400 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{validationErrors.email}</span>
            </p>
          )}
        </div>

        {/* --- MANDATORY FIELD 3: Mobile Number --- */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="reg-phone" className="text-xs font-bold text-slate-200 flex items-center space-x-1">
              <span>Mobile Number</span>
              <span className="text-cyan-400 text-sm">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Mandatory</span>
          </div>
          <div className="relative">
            <Phone className={`w-4 h-4 absolute left-3 top-3.5 transition-colors ${
              validationErrors.phone ? 'text-red-400' : touched.phone && formData.phone ? 'text-cyan-400' : 'text-slate-400'
            }`} />
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 9876543210 or +91 98765 43210"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              disabled={isFormBusy}
              className={`w-full min-h-[48px] bg-slate-900/80 border rounded-xl pl-9 pr-9 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 transition-all outline-none font-mono ${
                validationErrors.phone
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : touched.phone && formData.phone && !validationErrors.phone
                  ? 'border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : 'border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
              }`}
            />
            {touched.phone && formData.phone && !validationErrors.phone && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3.5" />
            )}
          </div>
          {validationErrors.phone ? (
            <p className="text-[11px] text-red-400 mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{validationErrors.phone}</span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-1">
              Indian 10-digit mobile, with optional country code (+91, +1, etc.)
            </p>
          )}
        </div>

        {/* Optional Professional Details Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowOptionalFields(prev => !prev)}
            className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 border-t border-slate-700/60 cursor-pointer"
          >
            <span>Add Company / Designation Details (Optional)</span>
            {showOptionalFields ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showOptionalFields && (
            <div className="space-y-3 pt-2">
              {/* Company & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-company" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="reg-company"
                      type="text"
                      placeholder="e.g. Precision CNC Works"
                      value={formData.company}
                      onChange={e => handleChange('company', e.target.value)}
                      disabled={isFormBusy}
                      className="w-full min-h-[48px] bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-role" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Designation / Role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="reg-role"
                      type="text"
                      placeholder="e.g. Production Lead"
                      value={formData.designation}
                      onChange={e => handleChange('designation', e.target.value)}
                      disabled={isFormBusy}
                      className="w-full min-h-[48px] bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* City & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-city" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    City / State
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="reg-city"
                      type="text"
                      placeholder="e.g. Bengaluru, Pune"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                      disabled={isFormBusy}
                      className="w-full min-h-[48px] bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-base sm:text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-type" className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Visitor Category
                  </label>
                  <select
                    id="reg-type"
                    value={formData.visitorType}
                    onChange={e => handleChange('visitorType', e.target.value)}
                    disabled={isFormBusy}
                    className="w-full min-h-[48px] bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs text-white outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {VISITOR_TYPES.map(type => (
                      <option key={type} value={type} className="bg-slate-900 text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- PRIVACY NOTICE & UNCHECKED CONSENT CHECKBOX --- */}
        <div className={`rounded-xl p-3 sm:p-3.5 border transition-all ${
          validationErrors.consent
            ? 'bg-red-950/30 border-red-500/60'
            : 'bg-slate-900/90 border-slate-700/80'
        }`}>
          {/* Privacy Notice Statement */}
          <div className="flex items-start space-x-2 text-[11px] text-slate-300 leading-relaxed mb-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-semibold">Privacy Notice: </strong>
              Your information is collected solely for administering your exhibition quiz participation, verifying your goodie claim at Booth A112 (Hall H1), and providing relevant technical updates from IMTEX and participating technology partners (Cogsdill & EnGenius). Your data is protected and never sold.
            </div>
          </div>

          {/* Unchecked Mandatory Consent Checkbox */}
          <label className="flex items-start space-x-3 cursor-pointer select-none group p-1 -m-1 rounded-lg hover:bg-slate-800/40 transition-colors">
            <div className="relative flex items-center pt-0.5">
              <input
                id="reg-consent"
                type="checkbox"
                checked={formData.consent}
                onChange={e => handleChange('consent', e.target.checked)}
                onBlur={() => handleBlur('consent')}
                disabled={isFormBusy}
                className="w-5 h-5 rounded border border-slate-600 bg-slate-950 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-cyan-400"
              />
            </div>
            <span className={`text-[11px] leading-tight transition-colors ${
              validationErrors.consent ? 'text-red-300 font-semibold' : 'text-slate-200 group-hover:text-white'
            }`}>
              I agree to the collection and use of my contact information for exhibition quiz participation, gift collection, and partner follow-up. <span className="text-cyan-400 font-bold">*</span>
            </span>
          </label>

          {validationErrors.consent && (
            <p className="text-[11px] text-red-400 mt-2 flex items-center space-x-1 pl-7">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{validationErrors.consent}</span>
            </p>
          )}
        </div>

        {/* --- START QUIZ ACTION BUTTON --- */}
        <button
          type="submit"
          disabled={isFormBusy}
          className="w-full min-h-[52px] py-3.5 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-400 hover:opacity-95 shadow-glow-cyan flex items-center justify-center space-x-2 transition-all touch-press disabled:opacity-50 text-sm sm:text-base cursor-pointer"
        >
          {isFormBusy ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Registering & Preparing Quiz...</span>
            </div>
          ) : (
            <>
              <span>Start Challenge (10 Qs)</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* 4. Quick Highlights Footer */}
      <div className="mt-3.5 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-[11px] text-slate-400">
        <div className="bg-slate-900/60 p-1.5 sm:p-2 rounded-xl border border-slate-800/80">
          <span className="block font-bold text-cyan-400">⏱️ ~2 Mins</span>
          <span className="truncate block">10 Questions</span>
        </div>
        <div className="bg-slate-900/60 p-1.5 sm:p-2 rounded-xl border border-slate-800/80">
          <span className="block font-bold text-amber-400">🎁 Win Goodies</span>
          <span className="truncate block">Booth A112</span>
        </div>
        <div className="bg-slate-900/60 p-1.5 sm:p-2 rounded-xl border border-slate-800/80">
          <span className="block font-bold text-emerald-400">📜 Certificate</span>
          <span className="truncate block">Official Badge</span>
        </div>
      </div>
    </div>
  );
};
