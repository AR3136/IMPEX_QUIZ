import React, { useEffect, useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import confetti from 'canvas-confetti';
import { Gift, MapPin, CheckCircle, RefreshCw, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { BrandingBanner } from '../components/BrandingBanner';

export const ThankYouPage: React.FC = () => {
  const { visitor, attemptId, submissionResult, resetToStart, timeSpentSeconds, error } = useQuiz();
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#00E5FF', '#FF9100', '#00E676', '#FFFFFF', '#FFD700'],
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

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const text = `I just participated in the IMTEX 2026/2027 Manufacturing Quiz Challenge! Visit Booth B102 (Hall 3A) to test your skills and collect tech goodies!`;
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
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-4 py-3 sm:py-4 max-w-md mx-auto space-y-3 sm:space-y-3.5 animate-fadeIn">
      {/* 1. Compact Header with Three Partner & Exhibition Logos */}
      <div className="w-full bg-white rounded-xl p-2 sm:p-2.5 shadow-card-dark border border-slate-200/90 flex items-center justify-around">
        <img
          src="/logos/imtex-logo.jpeg"
          alt="IMTEX Exhibition Logo"
          className="h-6 sm:h-8 w-auto max-w-[70px] sm:max-w-[85px] object-contain"
        />
        <div className="w-[1px] h-4 sm:h-5 bg-slate-200" />
        <img
          src="/logos/cogsdill-logo.jpeg"
          alt="Cogsdill"
          className="h-3.5 sm:h-5 w-auto max-w-[50px] sm:max-w-[65px] object-contain"
        />
        <div className="w-[1px] h-4 sm:h-5 bg-slate-200" />
        <img
          src="/logos/engenius-logo.jpeg"
          alt="EnGenius Technologies"
          className="h-3.5 sm:h-5 w-auto max-w-[50px] sm:max-w-[65px] object-contain"
        />
      </div>

      {/* 2. Primary Celebration & Main Message */}
      <div className="text-center space-y-1 pt-0.5 sm:pt-1">
        {/* Animated Gift Icon with Pulsing Ambient Halo */}
        <div className="relative inline-block my-0.5 sm:my-1">
          <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-xl animate-pulse pointer-events-none" />
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-glow-amber mx-auto flex items-center justify-center transform hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950/70 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-7 h-7 sm:w-10 sm:h-10 text-amber-300 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Required Main Heading */}
        <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Thank You for Participating!
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto">
          Your quiz responses have been recorded successfully in our exhibition system.
        </p>
      </div>

      {/* 3. Prominent Call To Action Banner: "Collect Your Goodies" */}
      <div className="glass-panel border-2 border-amber-400/90 rounded-2xl p-3.5 sm:p-5 text-center shadow-glow-amber relative overflow-hidden bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-imtex-card">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1.5 sm:mb-2">
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400" />
          <span>Exhibition Gift Pass</span>
        </div>

        {/* Prominent CTA Heading */}
        <div className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wide">
          Collect Your Goodies
        </div>

        {/* Booth Staff Instruction */}
        <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-slate-200 leading-relaxed">
          <span className="block font-bold text-amber-300 text-sm mb-0.5">
            👉 Please show this screen to the booth staff
          </span>
          Visit <strong className="text-white">Booth B102 (Hall 3A)</strong> to verify your participation and claim your exclusive IMTEX tech souvenir!
        </div>
      </div>

      {/* 4. Compact Submission ID & Participant Card */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-cyan-500/30 shadow-card-dark text-left space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
              Participant Verification ID
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="font-mono text-base sm:text-lg font-black text-white tracking-wider">
                {verificationId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy ID"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved</span>
          </div>
        </div>

        {/* Participant Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Name:</span>
            <strong className="text-slate-100 truncate block">{visitor?.name || 'Exhibition Attendee'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Company:</span>
            <strong className="text-slate-100 truncate block">{visitor?.company || 'Industry Delegate'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Category:</span>
            <span className="text-slate-300 truncate block">{visitor?.visitorType || 'Professional'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Time Spent:</span>
            <span className="font-mono text-cyan-300 block">{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* 5. Touch Action Controls */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleShare}
          className="min-h-[48px] py-3 px-3 rounded-xl border border-cyan-500/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/60 font-bold text-xs flex items-center justify-center space-x-1.5 touch-press cursor-pointer"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>{copied ? 'ID Copied!' : 'Share Pass'}</span>
        </button>

        <button
          type="button"
          onClick={resetToStart}
          className="min-h-[48px] py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 touch-press cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>Next Attendee</span>
        </button>
      </div>

      {/* 6. Exhibition Location Tag */}
      <div className="text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate max-w-full">BIEC • Hall 3A • Booth B102</span>
      </div>
    </div>
  );
};
