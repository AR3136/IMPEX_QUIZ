import React from 'react';

interface BrandingBannerProps {
  compact?: boolean;
}

export const BrandingBanner: React.FC<BrandingBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-1.5 sm:space-x-2 py-0.5">
        <div className="bg-white rounded-lg px-2 py-0.5 shadow-sm border border-slate-200/90 flex items-center space-x-2 h-8">
          {/* IMTEX */}
          <img
            src="/logos/imtex-logo.jpeg"
            alt="IMTEX Exhibition Logo"
            className="h-5 sm:h-6 w-auto max-w-[65px] sm:max-w-[75px] object-contain"
          />
          <div className="w-[1px] h-4 bg-slate-200" />
          {/* Cogsdill */}
          <img
            src="/logos/cogsdill-logo.jpeg"
            alt="Cogsdill Logo"
            className="h-3.5 sm:h-4 w-auto max-w-[50px] sm:max-w-[60px] object-contain"
          />
          <div className="w-[1px] h-4 bg-slate-200" />
          {/* EnGenius */}
          <img
            src="/logos/engenius-logo.jpeg"
            alt="EnGenius Technologies Logo"
            className="h-3.5 sm:h-4 w-auto max-w-[50px] sm:max-w-[60px] object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-3.5 sm:mb-4">
      {/* Exhibition Showcase Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-card-dark border border-cyan-500/30 relative overflow-hidden">
        {/* Subtle aesthetic backdrop lighting */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-100/60 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-100/40 via-transparent to-transparent pointer-events-none rounded-bl-2xl" />

        {/* Primary Row: IMTEX Exhibition Official Logo */}
        <div className="flex flex-col items-center justify-center pb-2.5 border-b border-slate-100 relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
            Official Exhibition Challenge
          </span>
          <img
            src="/logos/imtex-logo.jpeg"
            alt="IMTEX Exhibition Logo"
            className="h-14 sm:h-16 w-auto max-w-[210px] object-contain"
          />
        </div>

        {/* Secondary Row: Industry Partners (Cogsdill & EnGenius) */}
        <div className="pt-2.5 relative z-10">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider uppercase text-center mb-2">
            Industry Technology Partners
          </p>
          <div className="grid grid-cols-2 gap-2.5 items-center justify-items-center">
            {/* Partner 1: Cogsdill */}
            <div className="w-full flex items-center justify-center p-1.5 h-10 sm:h-11 bg-slate-50 rounded-xl border border-slate-150 shadow-inner">
              <img
                src="/logos/cogsdill-logo.jpeg"
                alt="Cogsdill Logo"
                className="max-h-6 sm:max-h-7 max-w-[115px] w-auto object-contain"
              />
            </div>

            {/* Partner 2: EnGenius Technologies */}
            <div className="w-full flex items-center justify-center p-1.5 h-10 sm:h-11 bg-slate-50 rounded-xl border border-slate-150 shadow-inner">
              <img
                src="/logos/engenius-logo.jpeg"
                alt="EnGenius Technologies Logo"
                className="max-h-6 sm:max-h-7 max-w-[115px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
