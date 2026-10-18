import React, { useEffect, useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import confetti from 'canvas-confetti';
import {
  Gift,
  MapPin,
  CheckCircle,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Sparkles,
  Eye,
  EyeOff,
  Award
} from 'lucide-react';

/**
 * Authoritative score feedback messages required by IMTEX specification:
 * 10/10: “Awesome! Perfect score!”
 * 9/10: “Excellent! Great job!”
 * 7–8/10: “Good job!”
 * 5–6/10: “Not bad! Keep learning!”
 * 0–4/10: “Thanks for participating! Keep exploring and learning!”
 */
function getScoreFeedback(score: number): { message: string; colorClass: string } {
  if (score === 10) {
    return { message: 'Awesome! Perfect score!', colorClass: 'text-imtex-gold' };
  }
  if (score === 9) {
    return { message: 'Excellent! Great job!', colorClass: 'text-emerald-400' };
  }
  if (score >= 7 && score <= 8) {
    return { message: 'Good job!', colorClass: 'text-imtex-gold' };
  }
  if (score >= 5 && score <= 6) {
    return { message: 'Not bad! Keep learning!', colorClass: 'text-[#D9E0E1]' };
  }
  return { message: 'Thanks for participating! Keep exploring and learning!', colorClass: 'text-[#D9E0E1]' };
}

export const ThankYouPage: React.FC = () => {
  const { visitor, attemptId, submissionResult, resetToStart, timeSpentSeconds } = useQuiz();
  const [copied, setCopied] = useState(false);

  // Requirement 2: Score is hidden by default; user can choose to reveal/hide it
  const [showScore, setShowScore] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#E9C66F', '#142629', '#FFFFFF', '#D9E0E1', '#F5F5F5'],
      });
    } catch {}
  }, []);

  const mins = Math.floor(timeSpentSeconds / 60);
  const secs = timeSpentSeconds % 60;
  const timeFormatted = `${mins}m ${secs}s`;

  // Determine the authoritative ID for booth verification
  const verificationId =
    attemptId ||
    submissionResult?.attemptId ||
    visitor?.submissionId ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('imtex_confirmed_attempt_id') : null) ||
    'IMTEX-PARTICIPANT';

  // Total score evaluated authoritatively on the server
  const score = submissionResult?.score ?? 0;
  const feedback = getScoreFeedback(score);

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const text = `I just participated in the IMTEX 2026/2027 Manufacturing Quiz Challenge! Visit Booth A161 (Hall 4) to test your skills and collect tech goodies!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IMTEX Exhibition Quiz Challenge',
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyId();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-4 py-3 sm:py-5 max-w-md mx-auto space-y-4 animate-fadeIn">
      {/* 1. Primary Celebration & Main Message */}
      <div className="text-center space-y-2 pt-1 sm:pt-2">
        {/* Animated Gift Icon with Pulsing Ambient Halo */}
        <div className="relative inline-block my-1">
          <div className="absolute inset-0 bg-imtex-gold/25 rounded-full blur-xl animate-pulse pointer-events-none" aria-hidden="true" />
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-imtex-goldHover via-imtex-gold to-imtex-goldLight p-0.5 shadow-glow-gold mx-auto flex items-center justify-center transform hover:scale-105 transition-transform">
            <div className="w-full h-full bg-imtex-dark/85 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-imtex-gold animate-bounce" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Required Main Heading with Accessible Font Sizing */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#F5F5F5] tracking-tight leading-tight">
          Thank You for Participating!
        </h1>

        <p className="text-sm sm:text-base text-[#D9E0E1] max-w-xs mx-auto leading-relaxed">
          Your quiz responses have been recorded successfully in our exhibition system.
        </p>
      </div>

      {/* 2. Prominent Call To Action Banner: "Collect Your Goodies" */}
      <div className="glass-panel border-2 border-imtex-gold rounded-2xl p-4 sm:p-5 text-center shadow-glow-gold relative overflow-hidden bg-gradient-to-b from-[#1F3D42]/60 via-imtex-card to-imtex-dark">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-imtex-gold/20 text-imtex-gold text-xs sm:text-sm font-black uppercase tracking-wider mb-2 border border-imtex-gold/40">
          <Sparkles className="w-4 h-4 text-imtex-gold" aria-hidden="true" />
          <span>Exhibition Gift Pass</span>
        </div>

        {/* Prominent CTA Heading */}
        <div className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-imtex-goldLight via-imtex-gold to-imtex-goldHover tracking-wide">
          Collect Your Goodies
        </div>

        {/* Booth Staff Instruction */}
        <div className="mt-3 p-3.5 rounded-xl bg-imtex-cardDark/90 border border-imtex-gold/30 text-sm sm:text-base text-[#D9E0E1] leading-relaxed">
          <span className="block font-bold text-imtex-gold text-base mb-1">
            👉 Please show this screen to the booth staff
          </span>
          Visit <strong className="text-[#F5F5F5] font-bold">Booth A161 (Hall 4)</strong> to verify your participation and claim your exclusive IMTEX tech souvenir!
        </div>
      </div>

      {/* 3. Requirement 2: Accessible Show Score / Hide Score Toggle */}
      <div className="glass-card rounded-2xl p-4 border border-imtex-gold/30 shadow-card-dark text-center space-y-3 bg-imtex-card/85">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-left">
            <Award className="w-5 h-5 text-imtex-gold shrink-0" aria-hidden="true" />
            <span className="text-sm sm:text-base font-bold text-[#F5F5F5]">Quiz Score</span>
          </div>

          <button
            type="button"
            onClick={() => setShowScore(prev => !prev)}
            aria-expanded={showScore}
            aria-controls="score-reveal-panel"
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl border border-imtex-gold/60 bg-imtex-dark hover:bg-imtex-card text-imtex-gold text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all touch-press cursor-pointer"
          >
            {showScore ? (
              <>
                <EyeOff className="w-4 h-4" aria-hidden="true" />
                <span>Hide Score</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" aria-hidden="true" />
                <span>Show Score</span>
              </>
            )}
          </button>
        </div>

        {/* Revealed Score Panel (Hidden by default; does NOT show individual answers) */}
        {showScore && (
          <div
            id="score-reveal-panel"
            className="pt-3 border-t border-imtex-gold/30 text-center space-y-2 animate-fadeIn"
          >
            <div className="text-xs uppercase tracking-widest text-[#D9E0E1] font-bold">
              Total Score
            </div>
            <div className="text-3xl sm:text-4xl font-black text-imtex-gold font-mono tracking-tight">
              {score} <span className="text-xl sm:text-2xl text-[#D9E0E1] font-normal">/ 10</span>
            </div>
            <p className={`text-sm sm:text-base font-bold ${feedback.colorClass} leading-relaxed`}>
              “{feedback.message}”
            </p>
            <p className="text-xs text-[#D9E0E1] pt-1">
              Score visibility does not affect your souvenir claim. Collect your goodies at Booth A161 (Hall 4)!
            </p>
          </div>
        )}
      </div>

      {/* 4. Requirement: White Card with Deep Charcoal Text for Participant Details */}
      <div className="bg-white rounded-2xl p-4 border-2 border-imtex-gold/40 shadow-card-dark text-left space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#202B2E]/70">
              Participant Verification ID
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="font-mono text-base sm:text-lg font-black text-[#202B2E] tracking-wider">
                {verificationId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy ID"
                aria-label="Copy Verification ID"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#202B2E] cursor-pointer touch-press"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Saved</span>
          </div>
        </div>

        {/* Participant Details with Accessible Sizing */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-slate-500 block mb-0.5">Name:</span>
            <strong className="text-[#202B2E] truncate block text-sm sm:text-base">{visitor?.name || 'Exhibition Attendee'}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-500 block mb-0.5">Mobile:</span>
            <span className="font-mono text-[#202B2E] font-bold truncate block text-sm sm:text-base">{visitor?.phone || 'Verified'}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block mb-0.5">Time Spent:</span>
            <span className="font-mono text-slate-700 block text-sm">{timeFormatted}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block mb-0.5">Status:</span>
            <span className="text-emerald-700 font-bold block text-sm">Verified</span>
          </div>
        </div>
      </div>

      {/* 5. Touch Action Controls: Primary Gold button + Secondary White button */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleShare}
          className="min-h-[52px] sm:min-h-[56px] py-3 px-3 rounded-xl bg-imtex-gold hover:bg-imtex-goldHover active:bg-[#d4ad4f] text-[#202B2E] font-black shadow-glow-gold flex items-center justify-center space-x-2 touch-press cursor-pointer text-sm sm:text-base"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
          <span>{copied ? 'ID Copied!' : 'Share Pass'}</span>
        </button>

        <button
          type="button"
          onClick={resetToStart}
          className="min-h-[52px] sm:min-h-[56px] py-3 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#202B2E] font-bold border border-slate-300 flex items-center justify-center space-x-2 touch-press cursor-pointer text-sm sm:text-base shadow-sm"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
          <span>Next Attendee</span>
        </button>
      </div>

      {/* 6. Exhibition Location Tag */}
      <div className="text-center text-xs sm:text-sm text-[#D9E0E1] flex items-center justify-center space-x-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <MapPin className="w-4 h-4 text-imtex-gold shrink-0" aria-hidden="true" />
        <span className="truncate max-w-full">BIEC • Hall 4 • Booth A161</span>
      </div>
    </div>
  );
};
