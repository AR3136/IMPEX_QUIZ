import React from 'react';
import { MapPin } from 'lucide-react';
import { BrandingBanner } from './BrandingBanner';

interface HeaderProps {
  showBoothInfo?: boolean;
  compactHeader?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showBoothInfo = true, compactHeader = false }) => {
  return (
    <header className="w-full pt-3 pb-2.5 px-3 sm:px-4 flex items-center justify-between border-b border-imtex-border/50 bg-imtex-dark/95 backdrop-blur-md sticky top-0 z-30">
      {/* Left: Compact branded cluster containing all 3 logos */}
      <div className="flex items-center space-x-2">
        <BrandingBanner compact />
      </div>

      {/* Right: Booth location tag */}
      {showBoothInfo && (
        <div className="flex items-center space-x-1.5 bg-slate-900/95 border border-amber-500/40 rounded-full px-2.5 py-1 shadow-sm shrink-0">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] font-bold text-amber-300 whitespace-nowrap">Hall 3A • B102</span>
        </div>
      )}
    </header>
  );
};
