import React, { useState } from 'react';
import { Lock, Search, Gift, CheckCircle2, AlertTriangle, ShieldAlert, LogOut, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { BrandingBanner } from '../components/BrandingBanner';

interface ParticipantRecord {
  submissionId: string;
  timestamp: string;
  name: string;
  company?: string;
  visitorType?: string;
  score: number;
  maxScore: number;
  completionStatus: string;
  goodiesCollected: 'Yes' | 'No';
  collectionTimestamp?: string;
}

const STORAGE_STAFF_TOKEN = 'imtex_staff_session_token';

// Helper to gracefully attempt nested or flat serverless endpoints
async function postStaffApi(endpoint: string, fallbackEndpoint: string, bodyObj: any, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(bodyObj)
  });

  // If 404 Not Found on the nested path, seamlessly fallback to the flat endpoint
  if (res.status === 404 && fallbackEndpoint) {
    res = await fetch(fallbackEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyObj)
    });
  }

  return res;
}

export const StaffPortalPage: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    try { return sessionStorage.getItem(STORAGE_STAFF_TOKEN); } catch { return null; }
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Search State
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<ParticipantRecord | null>(null);

  // Action State
  const [isConfirming, setIsConfirming] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleReturnToQuiz = () => {
    window.location.hash = '';
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const res = await postStaffApi('/api/staff/login', '/api/staff-login', { passcode: passcode.trim() });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      setToken(data.token);
      try { sessionStorage.setItem(STORAGE_STAFF_TOKEN, data.token); } catch {}
      setPasscode('');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    try { sessionStorage.removeItem(STORAGE_STAFF_TOKEN); } catch {}
    setParticipant(null);
    setSearchId('');
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim() || !token) return;

    setIsSearching(true);
    setSearchError(null);
    setParticipant(null);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await postStaffApi('/api/staff/lookup', '/api/staff-lookup', { submissionId: searchId.trim() }, token);

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error('Staff session expired. Please log in again.');
        }
        throw new Error(data.error || 'Participant lookup failed.');
      }

      setParticipant(data.participant);
    } catch (err: any) {
      setSearchError(err.message || 'Lookup failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkCollected = async () => {
    if (!participant || !token || isConfirming) return;

    setIsConfirming(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await postStaffApi('/api/staff/collect', '/api/staff-collect', { submissionId: participant.submissionId }, token);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update collection status.');
      }

      // Update local view
      setParticipant(prev => prev ? ({
        ...prev,
        goodiesCollected: 'Yes',
        collectionTimestamp: data.collectionTimestamp
      }) : null);

      setActionSuccess('Goodies successfully marked as collected in Google Sheets!');
    } catch (err: any) {
      setActionError(err.message || 'Error marking goodies.');
    } finally {
      setIsConfirming(false);
    }
  };

  // 1. Unauthenticated View (Login Screen)
  if (!token) {
    return (
      <div className="w-full flex-1 flex flex-col justify-center px-4 py-6 max-w-sm mx-auto">
        <BrandingBanner compact />

        <div className="glass-panel rounded-2xl p-6 shadow-card-dark border border-imtex-gold/40 text-center space-y-4 mt-4 bg-imtex-card">
          <div className="w-12 h-12 rounded-2xl bg-imtex-gold/20 text-imtex-gold mx-auto flex items-center justify-center shadow-glow-gold-sm">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>

          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-imtex-gold">
              Staff Portal
            </span>
            <h1 className="text-2xl font-black text-[#F5F5F5] mt-1">Booth A161 Login</h1>
            <p className="text-xs sm:text-sm text-[#D9E0E1] mt-1.5 leading-relaxed">
              Enter authorized staff passcode to access goodies redemption.
            </p>
          </div>

          {authError && (
            <div role="alert" className="bg-red-950/80 border border-red-500/60 text-red-200 text-xs sm:text-sm p-3 rounded-xl flex items-center space-x-2 text-left">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Staff Passcode"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                disabled={isLoggingIn}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                className="w-full min-h-[50px] bg-white border border-slate-300 focus:border-imtex-gold rounded-xl pl-4 pr-11 py-2 text-center text-base sm:text-sm text-[#202B2E] placeholder-slate-400 tracking-widest outline-none font-mono focus:ring-2 focus:ring-imtex-gold/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-[#202B2E] p-0.5 cursor-pointer"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
                aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !passcode.trim()}
              className="w-full min-h-[50px] py-3 px-4 rounded-xl font-black text-[#202B2E] bg-imtex-gold hover:bg-imtex-goldHover shadow-glow-gold flex items-center justify-center space-x-2 transition-all touch-press cursor-pointer disabled:opacity-50 text-sm sm:text-base"
            >
              {isLoggingIn ? 'Authenticating...' : 'Enter Booth Staff Portal'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReturnToQuiz}
              className="text-xs sm:text-sm text-[#D9E0E1] hover:text-imtex-gold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Attendee Quiz</span>
            </button>
          </div>

          <p className="text-xs text-[#D9E0E1]/60">
            Protected server endpoint. Access attempts are rate-limited and logged.
          </p>
        </div>
      </div>
    );
  }

  // 2. Authenticated Staff View
  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-4 py-3 sm:py-5 max-w-md mx-auto space-y-4">
      {/* Staff Top Navigation */}
      <div className="flex items-center justify-between border-b border-imtex-gold/25 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span className="text-sm font-bold text-[#F5F5F5]">Booth A161 Staff Active</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReturnToQuiz}
            className="text-xs sm:text-sm text-[#D9E0E1] hover:text-imtex-gold flex items-center space-x-1 p-1 rounded cursor-pointer touch-press"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Quiz</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm text-[#D9E0E1] hover:text-red-400 flex items-center space-x-1 p-1 rounded cursor-pointer touch-press"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Participant ID or Mobile Number Search Box */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-card-dark border border-imtex-gold/30 space-y-3 bg-imtex-card">
        <div>
          <label className="block text-sm sm:text-base font-bold text-[#F5F5F5] mb-1">
            Participant Lookup
          </label>
          <p className="text-xs sm:text-sm text-[#D9E0E1] mb-2 leading-relaxed">
            Enter the Submission ID or Mobile Number shown on the attendee's confirmation screen:
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" aria-hidden="true" />
            <input
              type="text"
              placeholder="e.g. ATTEMPT-... or 98765 43210"
              value={searchId}
              onChange={e => setSearchId(e.target.value.toUpperCase())}
              disabled={isSearching}
              className="w-full min-h-[50px] bg-white border border-slate-300 focus:border-imtex-gold rounded-xl pl-9 pr-3 py-2 text-sm sm:text-base font-mono text-[#202B2E] placeholder-slate-400 uppercase outline-none focus:ring-2 focus:ring-imtex-gold/40"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchId.trim()}
            className="min-h-[50px] px-4 rounded-xl bg-imtex-gold hover:bg-imtex-goldHover text-[#202B2E] font-black text-sm transition-all touch-press cursor-pointer disabled:opacity-50 shrink-0 flex items-center space-x-1.5 shadow-glow-gold"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" /> : <span>Find</span>}
          </button>
        </form>

        {searchError && (
          <div role="alert" className="bg-red-950/80 border border-red-500/60 text-red-200 text-xs sm:text-sm p-3 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Lookup Result & Verification Card */}
      {participant && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-imtex-gold/30 shadow-card-dark space-y-3.5 animate-fadeIn bg-imtex-card/90">
          {/* Header Status */}
          <div className="flex items-center justify-between border-b border-imtex-gold/25 pb-2.5">
            <div>
              <span className="text-xs font-bold text-[#D9E0E1] uppercase tracking-wider">
                Submission ID
              </span>
              <div className="font-mono text-sm sm:text-base font-black text-imtex-gold">
                {participant.submissionId}
              </div>
            </div>

            {/* Status Badge */}
            {participant.goodiesCollected === 'Yes' ? (
              <div className="px-3 py-1 rounded-full bg-red-950/90 border border-red-500/70 text-red-300 text-xs font-black uppercase flex items-center space-x-1 shadow-md">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                <span>ALREADY CLAIMED</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 text-xs font-black uppercase flex items-center space-x-1 shadow-glow-gold-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>ELIGIBLE FOR GIFT</span>
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div className="grid grid-cols-2 gap-3 text-sm bg-imtex-dark/70 p-3 rounded-xl border border-imtex-gold/20">
            <div>
              <span className="text-xs text-[#D9E0E1] block mb-0.5">Participant:</span>
              <strong className="text-[#F5F5F5] text-base">{participant.name}</strong>
            </div>
            <div>
              <span className="text-xs text-[#D9E0E1] block mb-0.5">Status:</span>
              <strong className="text-emerald-400">{participant.completionStatus}</strong>
            </div>
            <div>
              <span className="text-xs text-[#D9E0E1] block mb-0.5">Submission Time:</span>
              <span className="text-[#D9E0E1] text-xs">{new Date(participant.timestamp).toLocaleTimeString() || 'Today'}</span>
            </div>
            <div>
              <span className="text-xs text-[#D9E0E1] block mb-0.5">Score (Staff Only):</span>
              <strong className="text-imtex-gold font-mono text-base">{participant.score} / {participant.maxScore}</strong>
            </div>
          </div>

          {/* Warning / Success Notifications */}
          {actionSuccess && (
            <div role="status" className="bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs sm:text-sm p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div role="alert" className="bg-red-950/90 border border-red-500/70 text-red-200 text-xs sm:text-sm p-3 rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Action Button: Mark Collected vs Disabled Notice */}
          {participant.goodiesCollected === 'Yes' ? (
            <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl text-center space-y-1">
              <span className="text-sm font-bold text-red-300 block">
                ⛔ Souvenir already issued
              </span>
              <p className="text-xs text-[#D9E0E1]">
                Claimed on: {new Date(participant.collectionTimestamp || '').toLocaleString() || 'Earlier Today'}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMarkCollected}
              disabled={isConfirming}
              className="w-full min-h-[52px] py-3 px-4 rounded-xl font-black text-[#202B2E] bg-imtex-gold hover:bg-imtex-goldHover shadow-glow-gold flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm sm:text-base"
            >
              <Gift className="w-5 h-5" aria-hidden="true" />
              <span>{isConfirming ? 'Updating Google Sheets...' : 'Mark Goodies as Collected'}</span>
            </button>
          )}
        </div>
      )}

      {/* Quick Reset / Scan Next Attendee */}
      {participant && (
        <button
          onClick={() => { setParticipant(null); setSearchId(''); }}
          className="w-full min-h-[48px] py-2.5 text-xs sm:text-sm font-bold text-[#202B2E] bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-center cursor-pointer shadow-sm"
        >
          Scan Next Participant
        </button>
      )}
    </div>
  );
};
