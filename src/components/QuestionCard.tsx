import React from 'react';
import { ClientQuestion, AnswerOption } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface QuestionCardProps {
  question: ClientQuestion;
  selectedOption: AnswerOption | undefined;
  onSelectOption: (opt: AnswerOption) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
}) => {
  const optionsList: Array<{ key: AnswerOption; label: string }> = [
    { key: 'A', label: question.options.A },
    { key: 'B', label: question.options.B },
    { key: 'C', label: question.options.C },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-4 py-2">
      {/* Question Prompt */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-cyan-500/20 shadow-card-dark mb-4">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400 mb-1.5">
          {question.section}
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
          {question.question}
        </h2>
      </div>

      {/* 3 Options (Tap targets) */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {optionsList.map(({ key, label }) => {
          const isSelected = selectedOption === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectOption(key)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex items-center space-x-3.5 touch-press ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-cyan-400 shadow-glow-cyan text-white'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-700/80 hover:border-slate-500 text-slate-200'
              }`}
            >
              {/* Option Key Badge */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {key}
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm sm:text-base font-medium leading-tight">
                {label}
              </div>

              {/* Radio Indicator */}
              <div className="shrink-0 text-cyan-400">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 fill-cyan-400 text-slate-950" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
