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
    <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-700/70 px-2.5 py-1 rounded-full text-xs font-mono font-medium text-cyan-300">
      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
      <span>{formatted}</span>
    </div>
  );
};
