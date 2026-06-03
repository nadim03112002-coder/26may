/**
 * ReadingScoreHUD — compact floating indicator shown during active reading/writing sessions.
 * Shows: mode, progress, next-reward countdown, score popup, warning/pause states.
 */
import React, { useEffect, useRef, useState } from 'react';
import { ReadingScoreState, WarningLevel } from '../utils/readingScoreEngine';

interface Props {
  state: ReadingScoreState;
  visible: boolean;
}

const ScorePopup: React.FC<{ pts: number }> = ({ pts }) => (
  <span className="absolute -top-5 right-1 text-emerald-400 font-black text-xs animate-bounce-up pointer-events-none select-none">
    +{pts}
  </span>
);

const WarningBadge: React.FC<{ level: WarningLevel }> = ({ level }) => {
  if (level === 0) return null;
  const isPaused = level === 3;
  const bg = isPaused ? 'bg-red-600' : level === 2 ? 'bg-orange-500' : 'bg-yellow-500';
  const icon = isPaused ? '⏸️' : '⚠️';
  const msg = isPaused
    ? 'Score paused · Aage padhein'
    : level === 2
    ? 'Score rukne wala hai · Progress karein'
    : '10% progress chahiye · 2 min mein';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bg} text-white text-[10px] font-bold leading-tight`}>
      <span>{icon}</span>
      <span>{msg}</span>
    </div>
  );
};

export const ReadingScoreHUD: React.FC<Props> = ({ state, visible }) => {
  const [popupKey, setPopupKey] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const prevScore = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.lastScoreEarned > 0 && state.lastScoreEarned !== prevScore.current) {
      prevScore.current = state.lastScoreEarned;
      setPopupKey(k => k + 1);
      setShowPopup(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShowPopup(false), 1800);
    }
  }, [state.lastScoreEarned, state.totalSessionScore]);

  if (!visible || state.isWindowClosed) return null;

  const isReading = state.mode === 'reading';
  const progressWidth = Math.min(100, state.progressPercent);
  const windowPct = Math.min(100, (state.sessionElapsedSec / state.maxWindowSec) * 100);

  return (
    <div
      className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none"
      style={{ minWidth: 220, maxWidth: 300 }}
    >
      {/* Main pill */}
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-xl border border-slate-700/60 w-full">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{isReading ? '📖' : '✍️'}</span>
            <span className="text-white text-[10px] font-black uppercase tracking-wider">
              {isReading ? 'Reading Score' : 'Writing Score'}
            </span>
            {state.isPaused && (
              <span className="bg-red-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PAUSED</span>
            )}
          </div>
          {/* Next reward countdown */}
          {!state.isPaused && (
            <div className="relative flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">+{isReading ? 5 : 25} in</span>
              <span className="text-emerald-400 font-black text-[11px] tabular-nums">
                {state.nextRewardInSec}s
              </span>
              {showPopup && <ScorePopup pts={state.lastScoreEarned} key={popupKey} />}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[9px] shrink-0">Progress</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <span className="text-white text-[10px] font-bold tabular-nums shrink-0">{Math.round(progressWidth)}%</span>
        </div>

        {/* Session window bar */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-slate-500 text-[9px] shrink-0">Window</span>
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400/70 rounded-full transition-all duration-1000"
              style={{ width: `${windowPct}%` }}
            />
          </div>
          <span className="text-slate-400 text-[9px] tabular-nums shrink-0">
            {Math.floor((state.maxWindowSec - state.sessionElapsedSec) / 60)}:{String(Math.max(0, (state.maxWindowSec - state.sessionElapsedSec) % 60)).padStart(2, '0')} left
          </span>
        </div>
      </div>

      {/* Warning badge */}
      {state.warningLevel > 0 && (
        <WarningBadge level={state.warningLevel} />
      )}
    </div>
  );
};
