import React, { useEffect, useState } from 'react';
import type { SystemSettings } from '../types';
import type { ScheduledTheme } from '../types';

interface Props {
  settings?: SystemSettings;
  userTier?: string;
  accentColor?: string;
}

function useCountdown(targetISO: string | null): string {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!targetISO) { setLabel(''); return; }
    const update = () => {
      const diff = new Date(targetISO).getTime() - Date.now();
      if (diff <= 0) { setLabel(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setLabel(`${d}d ${h % 24}h`);
      } else if (h > 0) {
        setLabel(`${h}h ${m}m`);
      } else {
        setLabel(`${m}m ${s}s`);
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetISO]);
  return label;
}

export function ScheduledThemeBadge({ settings, userTier, accentColor = '#3b82f6' }: Props) {
  const [showModal, setShowModal] = useState(false);

  const scheduledThemes: ScheduledTheme[] = (settings as any)?.scheduledThemes || [];

  const now = Date.now();

  const relevantTheme = scheduledThemes.find(t => {
    if (t.target !== 'ALL') {
      const tierMap: Record<string, string> = { ultra: 'ULTRA', basic: 'BASIC', free: 'FREE' };
      const mappedTier = tierMap[userTier || 'free'] || 'FREE';
      if (t.target !== mappedTier) return false;
    }
    const start = new Date(t.scheduledAt).getTime();
    const end = start + t.durationHours * 3600000;
    return now < end;
  });

  if (!relevantTheme) return null;

  const startMs = new Date(relevantTheme.scheduledAt).getTime();
  const endMs = startMs + relevantTheme.durationHours * 3600000;
  const isActive = now >= startMs && now < endMs;
  const isUpcoming = now < startMs;

  const countdownTarget = isUpcoming ? relevantTheme.scheduledAt
    : isActive ? new Date(endMs).toISOString() : null;

  return <BadgeInner
    theme={relevantTheme}
    isActive={isActive}
    isUpcoming={isUpcoming}
    countdownTarget={countdownTarget}
    accentColor={accentColor}
    showModal={showModal}
    setShowModal={setShowModal}
  />;
}

function BadgeInner({
  theme, isActive, isUpcoming, countdownTarget, accentColor, showModal, setShowModal,
}: {
  theme: ScheduledTheme;
  isActive: boolean;
  isUpcoming: boolean;
  countdownTarget: string | null;
  accentColor: string;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}) {
  const countdown = useCountdown(countdownTarget);

  if (!countdown) return null;

  const btnBg = isActive
    ? `linear-gradient(135deg, ${theme.themeColors?.topBarStart || accentColor}, ${theme.themeColors?.btnEnd || accentColor})`
    : 'rgba(255,255,255,0.12)';

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-white transition-all active:scale-90 shrink-0 border border-white/15"
        style={{ background: btnBg, minWidth: 0 }}
      >
        <span className="text-[10px]">{theme.themeEmoji || '🎨'}</span>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[7px] font-black text-white/70 uppercase tracking-wide">
            {isActive ? 'Active' : 'Coming'}
          </span>
          <span className="text-[9px] font-black text-white">{countdown}</span>
        </div>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm mx-4 mb-6 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: '#0d0f1a' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Color preview bar */}
            <div
              className="h-24 flex items-end p-4"
              style={{
                background: `linear-gradient(135deg, ${theme.themeColors?.topBarStart || '#1e3a8a'}, ${theme.themeColors?.topBarEnd || '#0f1e3c'})`,
              }}
            >
              <div className="flex gap-2">
                {[
                  theme.themeColors?.navActive,
                  theme.themeColors?.btnStart,
                  theme.themeColors?.btnEnd,
                  theme.themeColors?.accentGlow,
                  theme.themeColors?.progressColor,
                ].filter(Boolean).slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{theme.themeEmoji || '🎨'}</span>
                <div>
                  <p className="text-base font-black text-white">{theme.themeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase"
                      style={{
                        background: isActive ? '#15803d20' : '#1e3a8a20',
                        color: isActive ? '#4ade80' : '#93c5fd',
                      }}
                    >
                      {isActive ? '🟢 Active Now' : '⏳ Coming Soon'}
                    </span>
                    <span className="text-[9px] text-white/30">
                      {theme.target === 'ALL' ? 'All users' : theme.target}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-3 border border-white/8" style={{ background: '#080a10' }}>
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">
                  {isActive ? 'Expires in' : 'Starts in'}
                </p>
                <p className="text-2xl font-black text-white">{countdown}</p>
                {isActive && (
                  <p className="text-[9px] text-white/30 mt-0.5">
                    Duration: {theme.durationHours}h
                  </p>
                )}
              </div>

              {theme.topBarEffect && (
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <span>✨</span>
                  <span>Includes animated top bar effect</span>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
