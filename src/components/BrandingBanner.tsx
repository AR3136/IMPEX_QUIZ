import React from 'react';

interface BrandingBannerProps {
  compact?: boolean;
}

export const BrandingBanner: React.FC<BrandingBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center min-w-0" role="banner" aria-label="IMTEX and Technology Partners">
        <div className="bg-white rounded-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 shadow-md border border-[#E9C66F]/40 flex items-center space-x-2 sm:space-x-3">
          {/* 1. IMTEX 2027 Official Logo */}
          <img
            src="/logos/imtex-2027-tricolor-brush-logo.png"
            alt="IMTEX 2027 Exhibition Logo"
            className="h-8 sm:h-10 md:h-11 w-auto max-w-[85px] sm:max-w-[115px] object-contain"
          />

          <div className="w-[1.5px] h-6 sm:h-7 bg-[#E9C66F]/30 shrink-0" aria-hidden="true" />

          {/* 2. Cogsdill Partner Logo */}
          <img
            src="/logos/cogsdill-logo.jpeg"
            alt="Cogsdill Tooling"
            className="h-5 sm:h-6 md:h-7 w-auto max-w-[70px] sm:max-w-[95px] object-contain"
          />

          <div className="w-[1.5px] h-6 sm:h-7 bg-[#E9C66F]/30 shrink-0" aria-hidden="true" />

          {/* 3. EnGenius Technologies Partner Logo */}
          <img
            src="/logos/engenius-logo.jpeg"
            alt="EnGenius Technologies"
            className="h-5 sm:h-6 md:h-7 w-auto max-w-[70px] sm:max-w-[95px] object-contain"
          />
        </div>
      </div>
    );
  }

  // Full Brand Showcase Card
  return (
    <div className="w-full mb-3 sm:mb-4" role="banner" aria-label="IMTEX and Technology Partners Showcase">
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-card-dark border-2 border-[#E9C66F]/40 relative overflow-hidden">
        {/* Aesthetic background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#E9C66F]/20 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#142629]/5 via-transparent to-transparent pointer-events-none rounded-bl-2xl" />

        {/* Row 1: IMTEX 2027 Exhibition Official Logo */}
        <div className="flex flex-col items-center justify-center pb-2.5 sm:pb-3 border-b border-[#E9C66F]/30 relative z-10">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#202B2E]/80 mb-1">
            Official Exhibition Challenge
          </span>
          <img
            src="/logos/imtex-2027-tricolor-brush-logo.png"
            alt="IMTEX 2027 Exhibition Logo"
            className="h-12 sm:h-16 md:h-20 w-auto max-w-[200px] sm:max-w-[260px] object-contain"
          />
        </div>

        {/* Row 2: Industry Technology Partners (Cogsdill & EnGenius) */}
        <div className="pt-2.5 sm:pt-3 relative z-10">
          <p className="text-[11px] sm:text-xs font-bold text-[#202B2E]/80 tracking-wider uppercase text-center mb-2">
            Industry Technology Partners
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-center justify-items-center">
            {/* Cogsdill */}
            <div className="w-full flex items-center justify-center p-2 h-11 sm:h-14 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <img
                src="/logos/cogsdill-logo.jpeg"
                alt="Cogsdill Tooling"
                className="max-h-7 sm:max-h-9 max-w-[115px] sm:max-w-[145px] w-auto object-contain"
              />
            </div>

            {/* EnGenius Technologies */}
            <div className="w-full flex items-center justify-center p-2 h-11 sm:h-14 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <img
                src="/logos/engenius-logo.jpeg"
                alt="EnGenius Technologies"
                className="max-h-7 sm:max-h-9 max-w-[115px] sm:max-w-[145px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
