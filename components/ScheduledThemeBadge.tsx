import React, { useEffect, useState } from 'react';
import type { SystemSettings } from '../types';
import type { ScheduledTheme } from '../types';
import { Clock, Zap, X } from 'lucide-react';

interface Props {
  settings?: SystemSettings;
  userTier?: string;
  accentColor?: string;
}

function useCountdown(targetISO: string | null): { label: string; secs: number } {
  const [state, setState] = useState({ label: '', secs: 0 });
  useEffect(() => {
    if (!targetISO) { setState({ label: '', secs: 0 }); return; }
    const update = () => {
      const diff = new Date(targetISO).getTime() - Date.now();
      if (diff <= 0) { setState({ label: '', secs: 0 }); return; }
      const totalSecs = Math.floor(diff / 1000);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      let label = '';
      if (h > 48) {
        const d = Math.floor(h / 24);
        label = `${d}d ${h % 24}h`;
      } else if (h > 0) {
        label = `${h}h ${m}m`;
      } else if (m > 0) {
        label = `${m}m ${s}s`;
      } else {
        label = `${s}s`;
      }
      setState({ label, secs: totalSecs });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetISO]);
  return state;
}

export function ScheduledThemeBadge({ settings, userTier, accentColor = '#3b82f6' }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);

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
  if (dismissed === relevantTheme.id) return null;

  const startMs = new Date(relevantTheme.scheduledAt).getTime();
  const endMs = startMs + relevantTheme.durationHours * 3600000;
  const isActive = now >= startMs && now < endMs;
  const isUpcoming = now < startMs;

  const countdownTarget = isUpcoming
    ? relevantTheme.scheduledAt
    : isActive ? new Date(endMs).toISOString() : null;

  return (
    <BadgeInner
      theme={relevantTheme}
      isActive={isActive}
      isUpcoming={isUpcoming}
      countdownTarget={countdownTarget}
      accentColor={accentColor}
      showModal={showModal}
      setShowModal={setShowModal}
      onDismiss={() => setDismissed(relevantTheme.id)}
    />
  );
}

function BadgeInner({
  theme, isActive, isUpcoming, countdownTarget, accentColor,
  showModal, setShowModal, onDismiss,
}: {
  theme: ScheduledTheme;
  isActive: boolean;
  isUpcoming: boolean;
  countdownTarget: string | null;
  accentColor: string;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  onDismiss: () => void;
}) {
  const { label: countdown } = useCountdown(countdownTarget);

  if (!countdown) return null;

  const startMs = new Date(theme.scheduledAt).getTime();
  const endMs = startMs + theme.durationHours * 3600000;

  // Active theme: show expiry countdown with theme color
  if (isActive) {
    return (
      <>
        <style>{`
          @keyframes themeActivePulse { 0%,100%{opacity:1} 50%{opacity:0.8} }
          @keyframes themeActiveBorder { 0%,100%{border-color:rgba(255,255,255,0.3)} 50%{border-color:rgba(255,255,255,0.6)} }
        `}</style>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-full border text-white transition-all active:scale-90 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${theme.themeColors?.topBarStart || accentColor}CC, ${theme.themeColors?.btnEnd || accentColor}CC)`,
            borderColor: 'rgba(255,255,255,0.3)',
            animation: 'themeActiveBorder 2s ease-in-out infinite',
            backdropFilter: 'blur(4px)',
            minWidth: 0,
          }}
          title={`Theme active — expires in ${countdown}`}
        >
          <span className="text-[11px]">{theme.themeEmoji || '🎨'}</span>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[6px] font-black text-white/70 uppercase tracking-wide">Expires</span>
            <span className="text-[9px] font-black text-white tabular-nums">{countdown}</span>
          </div>
        </button>

        {showModal && (
          <ActiveThemeModal
            theme={theme}
            countdown={countdown}
            endMs={endMs}
            accentColor={accentColor}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // Upcoming theme: show "Coming Soon" with countdown
  if (isUpcoming) {
    return (
      <>
        <style>{`
          @keyframes comingSoonBlink { 0%,100%{opacity:1} 50%{opacity:0.65} }
          @keyframes comingSoonBg { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        `}</style>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-full border text-white transition-all active:scale-90 shrink-0"
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(6px)',
            minWidth: 0,
          }}
          title={`Coming soon: ${theme.themeName} in ${countdown}`}
        >
          <span className="text-[10px]">{theme.themeEmoji || '🎨'}</span>
          <div className="flex flex-col items-start leading-none">
            <span
              className="text-[6px] font-black uppercase tracking-wide"
              style={{ color: theme.themeColors?.navActive || '#93c5fd', animation: 'comingSoonBlink 2s ease-in-out infinite' }}
            >
              Coming Soon
            </span>
            <span className="text-[9px] font-black text-white tabular-nums">{countdown}</span>
          </div>
        </button>

        {showModal && (
          <ComingSoonModal
            theme={theme}
            countdown={countdown}
            startMs={startMs}
            endMs={endMs}
            accentColor={accentColor}
            onClose={() => setShowModal(false)}
            onDismiss={onDismiss}
          />
        )}
      </>
    );
  }

  return null;
}

// ─── Active Theme Modal ────────────────────────────────────────────────────────
function ActiveThemeModal({ theme, countdown, endMs, accentColor, onClose }: {
  theme: ScheduledTheme; countdown: string; endMs: number;
  accentColor: string; onClose: () => void;
}) {
  const totalMs = theme.durationHours * 3600000;
  const startMs = new Date(theme.scheduledAt).getTime();
  const elapsed = Date.now() - startMs;
  const progress = Math.max(0, Math.min(1, elapsed / totalMs));

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm mx-4 mb-6 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: '#0a0c14' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Color band */}
        <div
          className="h-28 flex items-end p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.themeColors?.topBarStart || '#1e3a8a'}, ${theme.themeColors?.topBarEnd || '#0f1e3c'})`,
          }}
        >
          {/* Color mix strip */}
          <div className="absolute bottom-0 left-0 right-0 h-3 flex opacity-70">
            {[
              theme.themeColors?.navActive,
              theme.themeColors?.btnStart,
              theme.themeColors?.btnEnd,
              theme.themeColors?.accentGlow,
              theme.themeColors?.progressColor,
            ].filter(Boolean).map((c, i) => (
              <div key={i} className="flex-1" style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-4xl">{theme.themeEmoji || '🎨'}</span>
            <div>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 uppercase">
                🟢 Active Now
              </span>
              <p className="text-base font-black text-white mt-1">{theme.themeName}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Expiry countdown */}
          <div className="rounded-2xl p-4 border border-white/8" style={{ background: '#080a10' }}>
            <p className="text-[8px] text-white/35 uppercase font-black tracking-wider mb-1">Theme Hat Jaayega</p>
            <p className="text-3xl font-black text-white tabular-nums">{countdown}</p>

            {/* Progress bar — time remaining */}
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(1 - progress) * 100}%`,
                  background: `linear-gradient(90deg, ${theme.themeColors?.btnStart || accentColor}, ${theme.themeColors?.navActive || accentColor})`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[7px] text-white/20">Shuru</span>
              <span className="text-[7px] text-white/20">{theme.durationHours}h baad khatam</span>
            </div>
          </div>

          {/* Target info */}
          <div className="flex items-center gap-2 text-[9px] text-white/40">
            <span>👥</span>
            <span>
              Target: {theme.target === 'ALL' ? 'Sabhi users' : theme.target} ·{' '}
              {theme.applyToProfile ? 'Profile ✓ · ' : ''}{theme.applyToBackground ? 'Background ✓' : ''}
            </span>
          </div>

          {theme.topBarEffect && (
            <div className="flex items-center gap-2 text-[9px] text-white/40">
              <Zap size={10} className="text-yellow-400" />
              <span>Animated top bar effect included</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Band Karo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Coming Soon Modal ─────────────────────────────────────────────────────────
function ComingSoonModal({ theme, countdown, startMs, endMs, accentColor, onClose, onDismiss }: {
  theme: ScheduledTheme; countdown: string; startMs: number; endMs: number;
  accentColor: string; onClose: () => void; onDismiss: () => void;
}) {
  const delayFromNow = startMs - Date.now();
  const delayHours = Math.ceil(delayFromNow / 3600000);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm mx-4 mb-6 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: '#0a0c14' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Preview header */}
        <div
          className="h-28 flex items-end p-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.themeColors?.topBarStart || '#1e3a8a'}80, ${theme.themeColors?.topBarEnd || '#0f1e3c'}80)`,
          }}
        >
          {/* "Locked" overlay effect */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-1">⏳</div>
              <span
                className="text-xs font-black px-3 py-1 rounded-full"
                style={{
                  background: `${theme.themeColors?.navActive || accentColor}25`,
                  color: theme.themeColors?.navActive || accentColor,
                  border: `1px solid ${theme.themeColors?.navActive || accentColor}40`,
                }}
              >
                Coming Soon
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-4xl opacity-60">{theme.themeEmoji || '🎨'}</span>
            <p className="text-base font-black text-white opacity-70">{theme.themeName}</p>
          </div>
        </div>

        {/* Color palette preview */}
        <div className="h-3 flex opacity-50">
          {[
            theme.themeColors?.navActive,
            theme.themeColors?.btnStart,
            theme.themeColors?.btnEnd,
            theme.themeColors?.accentGlow,
            theme.themeColors?.progressColor,
          ].filter(Boolean).map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Countdown to start */}
          <div className="rounded-2xl p-4 border border-white/8" style={{ background: '#080a10' }}>
            <p className="text-[8px] text-white/35 uppercase font-black tracking-wider mb-1">Shuru Hoga</p>
            <p className="text-3xl font-black tabular-nums" style={{ color: theme.themeColors?.navActive || '#93c5fd' }}>
              {countdown}
            </p>
            <p className="text-[8px] text-white/25 mt-1">
              {theme.durationHours}h chalega · Target: {theme.target === 'ALL' ? 'Sabhi users' : theme.target}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {theme.applyToProfile && (
              <div className="flex items-center gap-2 text-[9px] text-white/50">
                <span>👤</span><span>Profile page background bhi badlega</span>
              </div>
            )}
            {theme.applyToBackground && (
              <div className="flex items-center gap-2 text-[9px] text-white/50">
                <span>🖼️</span><span>App background bhi badlega</span>
              </div>
            )}
            {theme.topBarEffect && (
              <div className="flex items-center gap-2 text-[9px] text-white/50">
                <Zap size={9} className="text-yellow-400" /><span>Animated top bar effect included</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { onClose(); onDismiss(); }}
              className="flex-1 py-3 rounded-2xl font-black text-sm text-white/50 active:scale-95 transition-all border border-white/8"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              Dismiss
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all"
              style={{
                background: `linear-gradient(135deg, ${theme.themeColors?.btnStart || accentColor}, ${theme.themeColors?.btnEnd || accentColor})`,
              }}
            >
              Samajh Gaya!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
