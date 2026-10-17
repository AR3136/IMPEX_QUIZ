import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  section: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, section }) => {
  const percentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full space-y-1.5 px-4 pt-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-cyan-400 font-bold">
            {current + 1} <span className="text-slate-500">/</span> {total}
          </span>
          <span className="text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50 truncate max-w-[200px]">
            {section}
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 font-semibold">{percentage}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/40">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out rounded-full shadow-glow-cyan"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
