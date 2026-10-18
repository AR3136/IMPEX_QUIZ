import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  section: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, section }) => {
  const percentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full space-y-2 px-4 pt-3">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="font-mono text-imtex-gold font-bold shrink-0">
            {current + 1} <span className="text-[#D9E0E1]/50">/</span> {total}
          </span>
          <span className="text-xs font-medium text-[#D9E0E1] bg-imtex-card/90 px-2.5 py-0.5 rounded-full border border-imtex-gold/30 truncate max-w-[220px]">
            {section}
          </span>
        </div>
        <span className="font-mono text-xs sm:text-sm text-imtex-gold font-bold shrink-0 ml-2">{percentage}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-imtex-dark rounded-full overflow-hidden border border-imtex-gold/25">
        <div
          className="h-full bg-imtex-gold transition-all duration-300 ease-out rounded-full shadow-glow-gold-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
