import React from 'react';
import { MapPin } from 'lucide-react';
import { BrandingBanner } from './BrandingBanner';

interface HeaderProps {
  showBoothInfo?: boolean;
  compactHeader?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showBoothInfo = true, compactHeader = false }) => {
  return (
    <header className="w-full pt-2.5 pb-2 px-2.5 sm:px-4 flex items-center justify-between border-b border-imtex-border/50 bg-imtex-dark/95 backdrop-blur-md sticky top-0 z-30 min-w-0">
      {/* Left: Compact branded cluster containing all 3 logos */}
      <div className="flex items-center min-w-0 flex-shrink">
        <BrandingBanner compact />
      </div>

      {/* Right: Booth location tag */}
      {showBoothInfo && (
        <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/95 border border-amber-500/40 rounded-full px-2 sm:px-2.5 py-1 shadow-sm shrink-0 ml-1.5">
          <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 whitespace-nowrap">Hall 3A • B102</span>
        </div>
      )}
    </header>
  );
};
