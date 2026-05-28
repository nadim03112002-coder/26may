import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';

const HINTS_KEY = 'nst_hints_seen_v1';
const HINT_DELAY = 2500; // ms before showing first hint

interface Hint {
  id: string;
  emoji: string;
  title: string;
  body: string;
  tab?: string;
}

const HINTS: Hint[] = [
  {
    id: 'revision_hub',
    emoji: '🔁',
    title: 'Revision Hub',
    body: 'Galat answers automatically track hote hain. Revision Hub mein wapas practice karo — smart spaced repetition ke saath!',
    tab: 'REVISION',
  },
  {
    id: 'tts_tap',
    emoji: '🔊',
    title: 'Tap-to-Read (TTS)',
    body: 'Kisi bhi note line pe tap karo — woh line Hindi/English mein bol dega. Long-press karo poora chapter sunne ke liye.',
  },
  {
    id: 'offline_save',
    emoji: '📥',
    title: 'Offline Save',
    body: 'Notes aur MCQs offline save kar sakte ho — internet nahi hai tab bhi padho!',
  },
  {
    id: 'mistake_bank',
    emoji: '❌',
    title: 'My Mistakes',
    body: 'Jo MCQ galat gaye woh automatically "My Mistakes" mein save hote hain. Wahan se focused practice karo.',
    tab: 'MCQ',
  },
  {
    id: 'lucent_book',
    emoji: '📖',
    title: 'Lucent Reader',
    body: 'Competition tab mein Lucent Book full reader milta hai — line by line TTS ke saath!',
    tab: 'COMPETITION',
  },
  {
    id: 'coins_streak',
    emoji: '🪙',
    title: 'Daily Login Coins',
    body: 'Roz login karo toh coins milte hain. Streak maintain karo — jitna bada streak, utne zyada coins!',
  },
  {
    id: 'theme_studio',
    emoji: '🎨',
    title: 'Theme Studio',
    body: 'Profile → Theme Studio mein apna custom color theme banao. Level 4+ pe unlock hota hai!',
    tab: 'PROFILE',
  },
];

interface Props {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const FeatureHints: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const [current, setCurrent] = useState<Hint | null>(null);
  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const [totalShown, setTotalShown] = useState(0);

  const getSeen = useCallback((): Set<string> => {
    try {
      const raw = localStorage.getItem(HINTS_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  }, []);

  const markSeen = useCallback((id: string) => {
    try {
      const seen = getSeen();
      seen.add(id);
      localStorage.setItem(HINTS_KEY, JSON.stringify([...seen]));
    } catch {}
  }, [getSeen]);

  const pickNextHint = useCallback(() => {
    const seen = getSeen();
    return HINTS.find(h => !seen.has(h.id)) || null;
  }, [getSeen]);

  useEffect(() => {
    // Don't show on first render immediately — wait a bit
    const timer = setTimeout(() => {
      const next = pickNextHint();
      if (next) {
        setCurrent(next);
        setVisible(true);
      }
    }, HINT_DELAY);
    return () => clearTimeout(timer);
  }, [pickNextHint]);

  const dismiss = useCallback((andNext = false) => {
    if (!current) return;
    setAnimOut(true);
    markSeen(current.id);
    setTimeout(() => {
      setAnimOut(false);
      setVisible(false);
      setCurrent(null);
      if (andNext) {
        const shown = totalShown + 1;
        setTotalShown(shown);
        // Show next hint after delay (only 3 per session max)
        if (shown < 3) {
          setTimeout(() => {
            const next = pickNextHint();
            if (next) { setCurrent(next); setVisible(true); }
          }, 600);
        }
      }
    }, 280);
  }, [current, markSeen, totalShown, pickNextHint]);

  if (!visible || !current) return null;

  return (
    <div
      className="fixed bottom-24 left-3 right-3 z-[999] pointer-events-none"
      style={{ maxWidth: 420, margin: '0 auto' }}
    >
      <div
        className="pointer-events-auto rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          border: '1px solid rgba(255,255,255,0.10)',
          animation: animOut
            ? 'hint-out 0.28s cubic-bezier(.4,0,.6,1) forwards'
            : 'hint-in 0.35s cubic-bezier(0,0,.2,1) forwards',
        }}
      >
        {/* Progress dots */}
        <div className="flex gap-1 px-4 pt-3 pb-1">
          {HINTS.slice(0, Math.min(HINTS.length, 5)).map((h, i) => {
            const seen = getSeen();
            const isDone = seen.has(h.id);
            return (
              <div key={h.id} className="h-[3px] flex-1 rounded-full transition-all"
                style={{ background: isDone ? '#3b82f6' : 'rgba(255,255,255,0.15)' }} />
            );
          })}
        </div>

        <div className="px-4 pt-2 pb-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{current.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={10} className="text-yellow-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Feature Tip</span>
                </div>
                <p className="text-sm font-black text-white leading-tight">{current.title}</p>
              </div>
            </div>
            <button
              onClick={() => dismiss(false)}
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-transform mt-0.5"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <X size={12} className="text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <p className="text-[12px] text-slate-300 leading-relaxed mb-3">{current.body}</p>

          {/* Actions */}
          <div className="flex gap-2">
            {current.tab && onTabChange && current.tab !== activeTab && (
              <button
                onClick={() => { dismiss(true); onTabChange(current!.tab!); }}
                className="flex-1 py-2 rounded-xl text-[11px] font-black text-white flex items-center justify-center gap-1 active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
              >
                Dekhein <ChevronRight size={12} />
              </button>
            )}
            <button
              onClick={() => dismiss(true)}
              className="flex-1 py-2 rounded-xl text-[11px] font-black active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.10)', color: '#94a3b8' }}
            >
              Samajh gaya ✓
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hint-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes hint-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(8px) scale(0.96); }
        }
      `}</style>
    </div>
  );
};
