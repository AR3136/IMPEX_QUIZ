import React from 'react';
import { MapPin } from 'lucide-react';
import { BrandingBanner } from './BrandingBanner';

interface HeaderProps {
  showBoothInfo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showBoothInfo = true }) => {
  return (
    <header className="w-full py-2 px-2.5 sm:px-4 border-b border-imtex-gold/30 bg-imtex-teal/95 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-2">
        {/* Consistent, enlarged logo brand area */}
        <div className="w-full sm:w-auto flex justify-center sm:justify-start min-w-0">
          <BrandingBanner compact />
        </div>

        {/* Exhibition Booth location badge */}
        {showBoothInfo && (
          <div className="flex items-center justify-center space-x-1.5 bg-imtex-card/95 border border-imtex-gold rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 shadow-sm shrink-0">
            <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-imtex-gold shrink-0" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-bold text-imtex-gold whitespace-nowrap">
              Hall 4 • A161
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
