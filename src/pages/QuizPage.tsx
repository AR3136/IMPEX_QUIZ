import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { ProgressBar } from '../components/ProgressBar';
import { QuizTimer } from '../components/QuizTimer';
import { QuestionCard } from '../components/QuestionCard';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const {
    questions,
    currentQuestionIndex,
    answers,
    timeSpentSeconds,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    isSubmitting,
    error,
  } = useQuiz();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300">Loading your personalized quiz...</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === questions.length - 1;
  const currentAnswer = answers[currentQ.id];
  const isAnswerSelected = currentAnswer !== undefined;

  const handleNextClick = () => {
    if (!isAnswerSelected) return;

    if (isLast) {
      setShowConfirmModal(true);
    } else {
      nextQuestion();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="w-full">
        <div className="px-4 pt-2.5 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300">
            Question <span className="text-cyan-400">{currentQuestionIndex + 1}</span> of {questions.length}
          </span>
          <QuizTimer seconds={timeSpentSeconds} />
        </div>

        <ProgressBar
          current={currentQuestionIndex}
          total={questions.length}
          section={currentQ.section}
        />
      </div>

      {/* Main Question Display */}
      <QuestionCard
        question={currentQ}
        selectedOption={currentAnswer}
        onSelectOption={opt => selectAnswer(currentQ.id, opt)}
      />

      {/* Error notification with explicit Retry Action */}
      {error && (
        <div className="mx-4 mb-3 bg-red-950/95 border border-red-500/70 text-red-200 text-xs p-3 rounded-xl space-y-2 shadow-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-red-300">Submission Error</strong>
              <span>{error}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={submitQuiz}
            disabled={isSubmitting}
            className="w-full py-2 px-3 rounded-lg bg-red-800 hover:bg-red-750 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Retrying Submission...' : 'Retry Submission'}</span>
          </button>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="p-3 sm:p-4 bg-imtex-dark/95 backdrop-blur-md border-t border-imtex-border/50 flex items-center justify-between space-x-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sticky bottom-0 z-20">
        <button
          type="button"
          onClick={prevQuestion}
          disabled={isFirst || isSubmitting}
          className="min-h-[50px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 active:bg-slate-800 text-slate-300 font-bold text-xs flex items-center space-x-1.5 disabled:opacity-30 touch-press cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isAnswerSelected || isSubmitting}
          className={`min-h-[50px] flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all touch-press cursor-pointer ${
            !isAnswerSelected
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              : isLast
              ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 text-slate-950 shadow-glow-cyan'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-glow-cyan'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Submitting Answers...</span>
            </div>
          ) : isLast ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish & Submit</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 text-center shadow-card-dark">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center shadow-glow-cyan">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Confirm Final Submission</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                You have answered all <strong>10 questions</strong>. Are you ready to submit? You cannot change your answers after submission.
              </p>
            </div>
            <div className="flex space-x-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 min-h-[48px] py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-750 active:bg-slate-700 touch-press cursor-pointer"
              >
                Review Answers
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  submitQuiz();
                }}
                className="flex-1 min-h-[48px] py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-400 text-slate-950 text-xs font-black shadow-glow-cyan hover:opacity-95 touch-press cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
