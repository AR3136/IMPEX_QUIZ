import React from 'react';

interface BrandingBannerProps {
  compact?: boolean;
}

export const BrandingBanner: React.FC<BrandingBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-center min-w-0 w-full" role="banner" aria-label="IMTEX and Technology Partners">
        <div className="bg-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-md border border-[#E9C66F]/50 flex items-center justify-between sm:justify-center space-x-2.5 sm:space-x-4 max-w-full">
          {/* 1. IMTEX 2027 Official Logo */}
          <img
            src="/logos/imtex-2027-tricolor-brush-logo.png"
            alt="IMTEX 2027 Exhibition Logo"
            className="h-11 sm:h-12 md:h-14 w-auto max-w-[105px] sm:max-w-[130px] object-contain shrink-0"
          />

          <div className="w-[1.5px] h-7 sm:h-8 bg-[#E9C66F]/40 shrink-0" aria-hidden="true" />

          {/* 2. Cogsdill Partner Logo */}
          <img
            src="/logos/cogsdill-logo.jpeg"
            alt="Cogsdill Tooling"
            className="h-7 sm:h-8 md:h-9 w-auto max-w-[110px] sm:max-w-[140px] object-contain shrink"
          />

          <div className="w-[1.5px] h-7 sm:h-8 bg-[#E9C66F]/40 shrink-0" aria-hidden="true" />

          {/* 3. EnGenius Technologies Partner Logo */}
          <img
            src="/logos/engenius-logo.jpeg"
            alt="EnGenius Technologies"
            className="h-7 sm:h-8 md:h-9 w-auto max-w-[95px] sm:max-w-[125px] object-contain shrink"
          />
        </div>
      </div>
    );
  }

  // Full Brand Showcase Card
  return (
    <div className="w-full mb-3 sm:mb-4" role="banner" aria-label="IMTEX and Technology Partners Showcase">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-card-dark border-2 border-[#E9C66F]/40 relative overflow-hidden">
        {/* Aesthetic background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#E9C66F]/20 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#142629]/5 via-transparent to-transparent pointer-events-none rounded-bl-2xl" />

        {/* Row 1: IMTEX 2027 Exhibition Official Logo */}
        <div className="flex flex-col items-center justify-center pb-3 border-b border-[#E9C66F]/30 relative z-10">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#202B2E]/80 mb-1.5">
            Official Exhibition Challenge
          </span>
          <img
            src="/logos/imtex-2027-tricolor-brush-logo.png"
            alt="IMTEX 2027 Exhibition Logo"
            className="h-14 sm:h-18 md:h-22 w-auto max-w-[220px] sm:max-w-[280px] object-contain"
          />
        </div>

        {/* Row 2: Industry Technology Partners (Cogsdill & EnGenius) */}
        <div className="pt-3 relative z-10">
          <p className="text-[11px] sm:text-xs font-bold text-[#202B2E]/80 tracking-wider uppercase text-center mb-2.5">
            Industry Technology Partners
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-center justify-items-center">
            {/* Cogsdill */}
            <div className="w-full flex items-center justify-center p-2.5 h-12 sm:h-15 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <img
                src="/logos/cogsdill-logo.jpeg"
                alt="Cogsdill Tooling"
                className="max-h-8 sm:max-h-10 max-w-[125px] sm:max-w-[155px] w-auto object-contain"
              />
            </div>

            {/* EnGenius Technologies */}
            <div className="w-full flex items-center justify-center p-2.5 h-12 sm:h-15 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <img
                src="/logos/engenius-logo.jpeg"
                alt="EnGenius Technologies"
                className="max-h-8 sm:max-h-10 max-w-[125px] sm:max-w-[155px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
