import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-imtex-gold text-[#202B2E] text-xs sm:text-sm font-bold px-4 py-2 flex items-center justify-center space-x-2 fixed top-0 left-0 right-0 z-50 shadow-md">
      <WifiOff className="w-4 h-4 animate-bounce" />
      <span>You appear to be offline. Quiz will sync once reconnected.</span>
    </div>
  );
};
