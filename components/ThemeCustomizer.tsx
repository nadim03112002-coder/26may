import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { buildOverrideTierTheme, TIER_THEME, getUserTier } from '../utils/tierTheme';
import { saveUserToLive } from '../firebase';
import { ArrowLeft, Check, RotateCcw, Sparkles, Palette, Eye } from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (u: User) => void;
  onBack: () => void;
}

const NAMED_THEMES = [
  { name: 'Ocean',   emoji: '🌊', color: '#0891b2' },
  { name: 'Sakura',  emoji: '🌸', color: '#db2777' },
  { name: 'Forest',  emoji: '🌿', color: '#059669' },
  { name: 'Gold',    emoji: '⚡', color: '#c8a020' },
  { name: 'Violet',  emoji: '💜', color: '#7c3aed' },
  { name: 'Sunset',  emoji: '🔥', color: '#f97316' },
  { name: 'Royal',   emoji: '👑', color: '#2563eb' },
  { name: 'Ruby',    emoji: '❤️', color: '#e11d48' },
  { name: 'Lime',    emoji: '🍀', color: '#65a30d' },
  { name: 'Navy',    emoji: '💙', color: '#1e3a8a' },
  { name: 'Maroon',  emoji: '🍷', color: '#9f1239' },
  { name: 'Cyan',    emoji: '💎', color: '#06b6d4' },
  { name: 'Indigo',  emoji: '🌌', color: '#4f46e5' },
  { name: 'Teal',    emoji: '🦋', color: '#0d9488' },
  { name: 'Rose',    emoji: '🌹', color: '#f43f5e' },
  { name: 'Silver',  emoji: '⚪', color: '#64748b' },
];

const WHAT_CHANGES = [
  { icon: '🔝', label: 'Top Bar',     desc: 'Header gradient badlega' },
  { icon: '🧭', label: 'Navigation',  desc: 'Bottom nav glow + border' },
  { icon: '🃏', label: 'Cards',       desc: 'Saare card backgrounds' },
  { icon: '🔘', label: 'Buttons',     desc: 'Action + premium buttons' },
  { icon: '✨', label: 'Borders',     desc: 'Outlines + separators' },
  { icon: '💫', label: 'Glow',        desc: 'Level + avatar glow' },
];

const timeLeft = (isoStr?: string): string | null => {
  if (!isoStr) return null;
  const diff = new Date(isoStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h baki`;
  return `${h}h ${m}m baki`;
};

export const ThemeCustomizer: React.FC<Props> = ({ user, onUpdateUser, onBack }) => {
  const tier = getUserTier(user);
  const baseTierTheme = TIER_THEME[tier];

  const tempActive = !!(user.tempThemeColor && user.tempThemeColorExpiry && new Date(user.tempThemeColorExpiry) > new Date());
  const tempTimeLeft = tempActive ? timeLeft(user.tempThemeColorExpiry) : null;

  const initialColor = (user as any).personalThemeColor || baseTierTheme.primary;
  const initialName = NAMED_THEMES.find(t => t.color.toLowerCase() === initialColor.toLowerCase())?.name ?? null;

  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedName, setSelectedName] = useState<string | null>(initialName);
  const [hexInput, setHexInput] = useState(initialColor);
  const [saving, setSaving] = useState(false);

  const liveTheme = useMemo(() => buildOverrideTierTheme(baseTierTheme, selectedColor), [selectedColor, baseTierTheme]);

  const handlePreset = (t: typeof NAMED_THEMES[0]) => {
    setSelectedColor(t.color);
    setHexInput(t.color);
    setSelectedName(t.name);
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setSelectedColor(val);
      setSelectedName(null);
    }
  };

  const handleColorPicker = (val: string) => {
    setSelectedColor(val);
    setHexInput(val);
    setSelectedName(null);
  };

  const handleApply = async () => {
    setSaving(true);
    const updated: User = { ...user, ...(({ personalThemeColor: _ }: any) => ({}))(user), personalThemeColor: selectedColor } as any;
    (updated as any).personalThemeColor = selectedColor;
    onUpdateUser(updated);
    try { await saveUserToLive(updated); } catch {}
    setSaving(false);
    alert(`✅ "${selectedName || 'Custom'}" theme permanently apply ho gayi!\nJab tak reset nahi karte, ye theme rahegi.`);
  };

  const handleReset = async () => {
    if (!confirm('Default tier theme pe wapas jaana chahte ho?')) return;
    setSaving(true);
    const updated = { ...user } as any;
    delete updated.personalThemeColor;
    onUpdateUser(updated);
    try { await saveUserToLive(updated); } catch {}
    setSaving(false);
  };

  const hasPersonal = !!(user as any).personalThemeColor;
  const isChanged = selectedColor !== initialColor;

  return (
    <div className="min-h-screen pb-32 select-none" style={{ background: '#080a10' }}>

      {/* ── HEADER (live preview of top bar) ── */}
      <div
        className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3 shadow-lg"
        style={{ backgroundImage: liveTheme.topBarGrad }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
        >
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-black text-white leading-tight">🎨 Theme Studio</p>
          <p className="text-[9px] text-white/60">Apna personal theme chuno</p>
        </div>
        <div
          className="w-6 h-6 rounded-full border-2 border-white/50 shrink-0 transition-colors duration-300"
          style={{ background: selectedColor }}
        />
      </div>

      <div className="px-4 pt-4 space-y-5">

        {/* ── ACTIVE THEME STATUS ── */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: `${liveTheme.primary}10`, borderColor: `${liveTheme.primary}35` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Eye size={13} style={{ color: liveTheme.primary }} />
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Abhi Active Theme</p>
          </div>

          {/* Redeem code theme (highest priority) */}
          {tempActive && (
            <div className="mb-2.5 rounded-xl p-2.5 border border-amber-500/25 bg-amber-500/8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: user.tempThemeColor! }} />
                <p className="text-xs font-black text-amber-300">🎁 Redeem Code Theme</p>
                {tempTimeLeft && (
                  <span
                    className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background: liveTheme.primary }}
                  >
                    ⏳ {tempTimeLeft}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-white/40 mt-1.5 ml-6">
                Expire hone ke baad aapka custom theme active ho jayega
              </p>
            </div>
          )}

          {/* Personal theme */}
          {hasPersonal ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full shrink-0 border border-white/30" style={{ background: (user as any).personalThemeColor }} />
              <p className="text-sm font-bold text-white">Custom Theme</p>
              <div
                className="ml-1 text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                style={{ background: `${liveTheme.primary}60` }}
              >
                {NAMED_THEMES.find(t => t.color === (user as any).personalThemeColor)?.name || 'Custom'}
              </div>
              <button
                onClick={handleReset}
                className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black text-red-300 border border-red-500/30 active:scale-95 transition-all"
              >
                <RotateCcw size={9} /> Reset
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full shrink-0 border border-white/20" style={{ background: baseTierTheme.primary }} />
              <p className="text-sm font-bold text-white/50">Default {tier.charAt(0).toUpperCase() + tier.slice(1)} Theme</p>
            </div>
          )}
        </div>

        {/* ── LIVE MINI PREVIEW ── */}
        <div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2.5">Live Preview</p>
          <div className="rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: `${liveTheme.primary}40` }}>

            {/* Mini top bar */}
            <div
              className="px-3 py-2.5 flex items-center gap-2 transition-all duration-500"
              style={{ backgroundImage: liveTheme.topBarGrad }}
            >
              <div className="flex-1 space-y-1">
                <div className="h-2 w-14 rounded-full bg-white/50" />
                <div className="h-1.5 w-20 rounded-full bg-white/25" />
              </div>
              <div className="flex items-center gap-1">
                <div className="h-5 px-2 rounded-full text-[8px] font-black text-white flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.22)' }}>
                  💠 L15
                </div>
                <div className="h-5 px-2 rounded-full text-[8px] font-black text-white flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  🪙 500
                </div>
              </div>
            </div>

            {/* Mini content area */}
            <div className="p-3 space-y-2" style={{ background: '#0d0d16' }}>
              <div className="grid grid-cols-2 gap-2">
                {[['📚', 'Notes'], ['🎯', 'MCQ']].map(([emoji, label]) => (
                  <div
                    key={label}
                    className="rounded-xl p-2.5 flex items-center gap-2 transition-all duration-500"
                    style={{ background: liveTheme.profileCardBg, border: `1px solid ${liveTheme.primary}35` }}
                  >
                    <span className="text-sm">{emoji}</span>
                    <span className="text-[9px] font-bold text-white/70">{label}</span>
                  </div>
                ))}
              </div>
              <div className="h-2 rounded-full" style={{ background: `${liveTheme.primary}30` }}>
                <div className="h-full w-3/5 rounded-full transition-all duration-500" style={{ background: liveTheme.pillGrad }} />
              </div>
              <div
                className="rounded-xl px-3 py-2 text-center transition-all duration-500"
                style={{ background: liveTheme.btnGrad, boxShadow: `0 3px 12px ${selectedColor}50` }}
              >
                <span className="text-[9px] font-black text-white">✨ Premium Action</span>
              </div>
            </div>

            {/* Mini bottom nav */}
            <div
              className="grid grid-cols-4 border-t transition-all duration-500"
              style={{ borderColor: `${liveTheme.primary}30`, background: liveTheme.profileBg }}
            >
              {['🏠', '📖', '🎯', '👤'].map((icon, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center py-2.5 gap-0.5"
                  style={{ opacity: i === 0 ? 1 : 0.35 }}
                >
                  <span className="text-base">{icon}</span>
                  <div
                    className="h-0.5 w-5 rounded-full transition-all duration-500"
                    style={{ background: i === 0 ? liveTheme.primary : 'transparent' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── NAMED PRESETS ── */}
        <div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Preset Themes</p>
          <div className="grid grid-cols-4 gap-2">
            {NAMED_THEMES.map(t => {
              const active = selectedName === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => handlePreset(t)}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl transition-all active:scale-90 border"
                  style={{
                    background: active ? `${t.color}22` : `${t.color}0d`,
                    borderColor: active ? t.color : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center relative"
                    style={{
                      background: t.color,
                      borderColor: active ? 'white' : 'transparent',
                      boxShadow: active ? `0 0 12px ${t.color}80` : 'none',
                    }}
                  >
                    {active && <Check size={13} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[8px] font-black text-white/70">{t.emoji}</span>
                  <span className="text-[8px] font-bold text-white/50">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CUSTOM COLOR PICKER ── */}
        <div className="rounded-2xl p-4 border border-white/6" style={{ background: '#111827' }}>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={13} style={{ color: liveTheme.primary }} />
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Custom Color</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={selectedColor}
              onChange={e => handleColorPicker(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer shrink-0"
              style={{ padding: '2px', background: 'transparent', border: 'none' }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-white/25 transition-colors">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: selectedColor }} />
                <input
                  type="text"
                  value={hexInput}
                  onChange={e => handleHexChange(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-mono text-white focus:outline-none"
                  placeholder="#3b82f6"
                  maxLength={7}
                />
              </div>
              <p className="text-[8px] text-white/25 mt-1.5">
                Ek color → pura app theme ✨
              </p>
            </div>
          </div>

          {/* Quick color row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {['#ffffff', '#ff0000', '#00ff88', '#ffcc00', '#00aaff', '#cc44ff', '#ff6600', '#0044ff'].map(c => (
              <button
                key={c}
                onClick={() => handleColorPicker(c)}
                className="w-6 h-6 rounded-full border-2 active:scale-90 transition-transform"
                style={{ background: c, borderColor: selectedColor === c ? 'white' : 'transparent' }}
              />
            ))}
          </div>
        </div>

        {/* ── WHAT CHANGES ── */}
        <div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2.5">Kya Kya Badlega?</p>
          <div className="grid grid-cols-2 gap-2">
            {WHAT_CHANGES.map(e => (
              <div
                key={e.label}
                className="flex items-start gap-2 rounded-xl p-2.5"
                style={{ background: '#111', border: `1px solid ${liveTheme.primary}20` }}
              >
                <span className="text-base leading-none shrink-0 mt-0.5">{e.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-white">{e.label}</p>
                  <p className="text-[8px] text-white/35 leading-snug mt-0.5">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── APPLY / RESET BUTTONS ── */}
        <div className="flex gap-2.5 pt-1">
          {hasPersonal && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl font-bold text-xs text-red-300 border border-red-500/25 active:scale-95 transition-all shrink-0"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <RotateCcw size={13} />
              Default
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white active:scale-95 transition-all"
            style={{
              background: liveTheme.btnGrad,
              boxShadow: `0 6px 24px ${selectedColor}55`,
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Sparkles size={16} />
            {saving ? 'Saving...' : `"${selectedName || 'Custom'}" Apply Karo`}
          </button>
        </div>

        <p className="text-[8px] text-white/20 text-center pb-4">
          Ye theme permanently rahegi jab tak tum khud reset nahi karte
        </p>
      </div>
    </div>
  );
};
