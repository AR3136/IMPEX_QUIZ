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
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-4 py-2">
      {/* Accessible Question Prompt */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-imtex-gold/30 shadow-card-dark mb-3 sm:mb-4 bg-imtex-card/85">
        <div className="text-xs sm:text-sm font-bold tracking-wider uppercase text-imtex-gold mb-1.5">
          {question.section}
        </div>
        <h2 className="text-base sm:text-xl font-bold text-[#F5F5F5] leading-snug sm:leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* 3 Options (Accessible Large Tap targets) */}
      <div className="space-y-3 flex-1 flex flex-col justify-center" role="radiogroup" aria-label="Question options">
        {optionsList.map(({ key, label }) => {
          const isSelected = selectedOption === key;

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectOption(key)}
              className={`w-full min-h-[58px] sm:min-h-[64px] text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center space-x-3.5 touch-press cursor-pointer ${
                isSelected
                  ? 'bg-imtex-gold border-2 border-imtex-gold shadow-glow-gold text-[#202B2E]'
                  : 'bg-imtex-card/80 hover:bg-imtex-cardHover active:bg-imtex-dark border-imtex-gold/25 hover:border-imtex-gold/50 text-[#F5F5F5]'
              }`}
            >
              {/* Option Key Badge */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-sm sm:text-base shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#202B2E] text-imtex-gold shadow-sm'
                    : 'bg-imtex-dark text-[#D9E0E1] border border-imtex-gold/30'
                }`}
                aria-hidden="true"
              >
                {key}
              </div>

              {/* Option Text with Accessible Sizing */}
              <div className={`flex-1 text-sm sm:text-base md:text-lg leading-relaxed ${isSelected ? 'font-bold text-[#202B2E]' : 'font-medium text-[#F5F5F5]'}`}>
                {label}
              </div>

              {/* Radio Indicator */}
              <div className="shrink-0" aria-hidden="true">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 fill-[#202B2E] text-imtex-gold" />
                ) : (
                  <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-[#D9E0E1]/40" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
