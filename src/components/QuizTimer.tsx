import React from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  seconds: number;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center space-x-1.5 bg-imtex-card/90 border border-imtex-gold/40 px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold text-imtex-gold shadow-sm">
      <Clock className="w-4 h-4 text-imtex-gold animate-pulse" aria-hidden="true" />
      <span>{formatted}</span>
    </div>
  );
};
