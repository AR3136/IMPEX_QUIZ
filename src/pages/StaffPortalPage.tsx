import React, { useState, useEffect } from 'react';
import { Lock, Search, Gift, CheckCircle2, AlertTriangle, ShieldAlert, LogOut, ArrowRight, ArrowLeft, UserCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
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

        <div className="glass-panel rounded-2xl p-6 shadow-card-dark border border-amber-500/40 text-center space-y-4 mt-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-glow-amber">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Staff Portal
            </span>
            <h1 className="text-xl font-black text-white">Booth A112 Login</h1>
            <p className="text-xs text-slate-300 mt-1">
              Enter your authorized staff passcode to access goodies redemption.
            </p>
          </div>

          {authError && (
            <div className="bg-red-950/80 border border-red-500/60 text-red-200 text-xs p-3 rounded-xl flex items-center space-x-2 text-left">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
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
                className="w-full min-h-[48px] bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl pl-4 pr-11 py-2 text-center text-base sm:text-sm text-white tracking-widest outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !passcode.trim()}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:opacity-95 shadow-glow-amber flex items-center justify-center space-x-2 transition-all touch-press cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Enter Booth Staff Portal'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReturnToQuiz}
              className="text-xs text-slate-400 hover:text-cyan-400 inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Attendee Quiz</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            Protected server endpoint. Access attempts are rate-limited and logged.
          </p>
        </div>
      </div>
    );
  }

  // 2. Authenticated Staff View
  return (
    <div className="w-full flex-1 flex flex-col justify-between px-3.5 sm:px-4 py-3 sm:py-4 max-w-md mx-auto space-y-4">
      {/* Staff Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">Booth A112 Staff Active</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReturnToQuiz}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1 p-1 rounded cursor-pointer touch-press"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quiz</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center space-x-1 p-1 rounded cursor-pointer touch-press"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Participant ID Search Box */}
      <div className="glass-panel rounded-2xl p-4 shadow-card-dark border border-cyan-500/30 space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1">
            Participant Lookup by Submission ID
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Enter or paste the ID shown on the attendee's confirmation screen:
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="e.g. ATTEMPT-20261017-XXXX"
              value={searchId}
              onChange={e => setSearchId(e.target.value.toUpperCase())}
              disabled={isSearching}
              className="w-full min-h-[48px] bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-base sm:text-xs font-mono text-white placeholder-slate-500 uppercase outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchId.trim()}
            className="min-h-[48px] px-4 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all touch-press cursor-pointer disabled:opacity-50 shrink-0 flex items-center space-x-1.5 shadow-glow-cyan"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Find</span>}
          </button>
        </form>

        {searchError && (
          <div className="bg-red-950/80 border border-red-500/60 text-red-200 text-xs p-2.5 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Lookup Result & Verification Card */}
      {participant && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-card-dark space-y-3.5 animate-fadeIn">
          {/* Header Status */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Submission ID
              </span>
              <div className="font-mono text-sm font-black text-cyan-300">
                {participant.submissionId}
              </div>
            </div>

            {/* Status Badge */}
            {participant.goodiesCollected === 'Yes' ? (
              <div className="px-2.5 py-1 rounded-full bg-red-950/90 border border-red-500/70 text-red-300 text-[10px] font-black uppercase flex items-center space-x-1 shadow-md">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>ALREADY CLAIMED</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 text-[10px] font-black uppercase flex items-center space-x-1 shadow-glow-cyan">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ELIGIBLE FOR GIFT</span>
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block">Participant:</span>
              <strong className="text-white text-sm">{participant.name}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Company / College:</span>
              <strong className="text-slate-200">{participant.company || 'Not Specified'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Category:</span>
              <span className="text-slate-300">{participant.visitorType || 'Professional'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Score (Staff Only):</span>
              <strong className="text-amber-400 font-mono text-sm">{participant.score} / {participant.maxScore}</strong>
            </div>
          </div>

          {/* Warning / Success Notifications */}
          {actionSuccess && (
            <div className="bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="bg-red-950/90 border border-red-500/70 text-red-200 text-xs p-3 rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Action Button: Mark Collected vs Disabled Notice */}
          {participant.goodiesCollected === 'Yes' ? (
            <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl text-center space-y-1">
              <span className="text-xs font-bold text-red-300 block">
                ⛔ Souvenir already issued
              </span>
              <p className="text-[10px] text-slate-400">
                Claimed on: {new Date(participant.collectionTimestamp || '').toLocaleString() || 'Today'}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMarkCollected}
              disabled={isConfirming}
              className="w-full min-h-[50px] py-3 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 shadow-glow-cyan flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              <Gift className="w-4 h-4" />
              <span>{isConfirming ? 'Updating Google Sheets...' : 'Mark Goodies as Collected'}</span>
            </button>
          )}
        </div>
      )}

      {/* Quick Reset / Scan Next Attendee */}
      {participant && (
        <button
          onClick={() => { setParticipant(null); setSearchId(''); }}
          className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white border border-slate-800 rounded-xl text-center cursor-pointer"
        >
          Scan Next Participant
        </button>
      )}
    </div>
  );
};
