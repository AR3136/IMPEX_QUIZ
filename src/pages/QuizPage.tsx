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
        <div className="w-12 h-12 border-4 border-imtex-gold border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
        <p className="text-[#F5F5F5] text-base sm:text-lg font-medium">Loading your personalized quiz...</p>
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
          <span className="text-sm sm:text-base font-mono font-bold text-[#F5F5F5]">
            Question <span className="text-imtex-gold font-extrabold">{currentQuestionIndex + 1}</span> of {questions.length}
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
        <div role="alert" className="mx-4 mb-3 bg-red-950/95 border border-red-500/80 text-red-200 text-sm p-3.5 rounded-xl space-y-2 shadow-lg animate-fadeIn">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="block text-red-300 font-bold">Submission Error</strong>
              <span>{error}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={submitQuiz}
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-lg bg-red-800 hover:bg-red-750 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isSubmitting ? 'Retrying Submission...' : 'Retry Submission'}</span>
          </button>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="p-3 sm:p-4 bg-imtex-teal/95 backdrop-blur-md border-t border-imtex-gold/30 flex items-center justify-between space-x-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sticky bottom-0 z-20">
        <button
          type="button"
          onClick={prevQuestion}
          disabled={isFirst || isSubmitting}
          className="min-h-[52px] sm:min-h-[56px] px-4 sm:px-5 py-3 rounded-xl border border-imtex-gold/40 bg-imtex-card hover:bg-imtex-cardHover active:bg-imtex-dark text-[#F5F5F5] font-bold text-sm sm:text-base flex items-center space-x-1.5 disabled:opacity-30 touch-press cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isAnswerSelected || isSubmitting}
          className={`min-h-[52px] sm:min-h-[56px] flex-1 py-3 px-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg transition-all touch-press cursor-pointer ${
            !isAnswerSelected
              ? 'bg-imtex-card/60 text-[#D9E0E1]/40 border border-imtex-gold/20 cursor-not-allowed opacity-60'
              : 'bg-imtex-gold hover:bg-imtex-goldHover active:bg-[#d4ad4f] text-[#202B2E] shadow-glow-gold'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-[#202B2E] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <span>Submitting Answers...</span>
            </div>
          ) : isLast ? (
            <>
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>Finish & Submit</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border-2 border-imtex-gold/40 rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 text-center shadow-card-dark bg-imtex-card">
            <div className="w-12 h-12 rounded-full bg-imtex-gold/20 text-imtex-gold mx-auto flex items-center justify-center shadow-glow-gold-sm">
              <HelpCircle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#F5F5F5]">Confirm Final Submission</h3>
              <p className="text-sm text-[#D9E0E1] mt-2 leading-relaxed">
                You have answered all <strong>10 questions</strong>. Are you ready to submit? You cannot change your answers after submission.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 min-h-[50px] py-2.5 px-3 rounded-xl border border-imtex-gold/40 bg-imtex-dark text-[#F5F5F5] text-sm font-bold hover:bg-imtex-card active:bg-imtex-dark touch-press cursor-pointer"
              >
                Review
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  submitQuiz();
                }}
                className="flex-1 min-h-[50px] py-2.5 px-3 rounded-xl bg-imtex-gold hover:bg-imtex-goldHover text-[#202B2E] text-sm font-black shadow-glow-gold hover:opacity-95 touch-press cursor-pointer"
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
