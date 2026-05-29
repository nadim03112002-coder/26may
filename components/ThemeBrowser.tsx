import React, { useState, useMemo, useCallback } from 'react';
import { ALL_THEMES, THEME_CATEGORIES, getThemesByCategory, AppTheme, ThemeCategory, ThemeRarity } from '../utils/themeLibrary';
import type { User, SystemSettings } from '../types';
import { TopBarEffectsLayer } from '../utils/topBarEffects';
import { Search, X, Lock, Zap, Clock, CheckCircle2, ChevronDown, ChevronUp, Calendar, Users, Star } from 'lucide-react';
import { getLevelInfo } from '../utils/levelSystem';

interface Props {
  user: User;
  settings?: SystemSettings;
  isAdmin?: boolean;
  onApplyTheme?: (theme: AppTheme) => void;
  onScheduleTheme?: (theme: AppTheme) => void;
  onBack?: () => void;
  accentColor?: string;
}

const RARITY_COLORS: Record<ThemeRarity, string> = {
  COMMON: '#64748b',
  RARE: '#3b82f6',
  EPIC: '#a855f7',
  LEGENDARY: '#f59e0b',
};
const RARITY_LABELS: Record<ThemeRarity, string> = {
  COMMON: 'Common',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
};

const PAGE_SIZE = 50;

export function ThemeBrowser({ user, settings, isAdmin, onApplyTheme, onScheduleTheme, onBack, accentColor = '#3b82f6' }: Props) {
  const [selectedCat, setSelectedCat] = useState<ThemeCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<AppTheme | null>(null);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Schedule options
  const [schedTarget, setSchedTarget] = useState<'ALL' | 'FREE' | 'BASIC' | 'ULTRA'>('ALL');
  const [schedHours, setSchedHours] = useState(24);
  const [schedDelay, setSchedDelay] = useState(0); // hours from now until start
  const [schedApplyProfile, setSchedApplyProfile] = useState(false);
  const [schedApplyBg, setSchedApplyBg] = useState(false);

  const userLevel = getLevelInfo(user.totalScore || 0).level;

  const filtered = useMemo(() => {
    let list = selectedCat === 'ALL' ? ALL_THEMES : getThemesByCategory(selectedCat as ThemeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
      );
    }
    return list;
  }, [selectedCat, search]);

  // Reset visible count when filter/search changes
  const prevFilterKey = React.useRef('');
  const filterKey = selectedCat + '|' + search;
  if (filterKey !== prevFilterKey.current) {
    prevFilterKey.current = filterKey;
    if (visibleCount !== PAGE_SIZE) setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleApply = useCallback((theme: AppTheme) => {
    if (theme.unlockLevel && userLevel < theme.unlockLevel && !isAdmin) return;
    setSelectedTheme(null);
    onApplyTheme?.(theme);
  }, [userLevel, isAdmin, onApplyTheme]);

  const handleSchedule = useCallback(() => {
    if (!selectedTheme) return;
    const scheduledAt = new Date(Date.now() + schedDelay * 3600000).toISOString();
    onScheduleTheme?.({
      ...selectedTheme,
      // embed schedule config into theme so parent can handle it
      _scheduleConfig: {
        target: schedTarget,
        durationHours: schedHours,
        scheduledAt,
        applyToProfile: schedApplyProfile,
        applyToBackground: schedApplyBg,
      } as any,
    } as AppTheme);
    setShowSchedulePanel(false);
    setSelectedTheme(null);
    alert(`✅ Theme "${selectedTheme.name}" scheduled! Starts in ${schedDelay}h, lasts ${schedHours}h.`);
  }, [selectedTheme, schedTarget, schedHours, schedDelay, schedApplyProfile, schedApplyBg, onScheduleTheme]);

  return (
    <div className="flex flex-col min-h-screen pb-32 select-none" style={{ background: '#06080f' }}>

      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 py-3 shadow-xl"
        style={{ background: `linear-gradient(135deg, #1e3a5f, #0f1e3c)`, boxShadow: `0 4px 20px ${accentColor}30` }}
      >
        <div className="flex items-center gap-3 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
            >
              <X size={14} className="text-white" />
            </button>
          )}
          <div>
            <p className="text-sm font-black text-white">📚 Theme Library</p>
            <p className="text-[9px] text-white/50">{ALL_THEMES.length}+ themes — find your perfect look</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[8px] text-white/40">Level</p>
            <p className="text-sm font-black text-amber-400">Lv.{userLevel}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search themes, tags..."
            className="w-full bg-white/8 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={10} className="text-white/30" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {[{ id: 'ALL', label: '✨ All', emoji: '' }, ...THEME_CATEGORIES.map(c => ({ id: c.id, label: c.label, emoji: c.emoji }))].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id as any)}
            className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-90 border"
            style={{
              background: selectedCat === cat.id ? `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` : '#0d0f1a',
              borderColor: selectedCat === cat.id ? accentColor : 'rgba(255,255,255,0.08)',
              color: selectedCat === cat.id ? '#fff' : 'rgba(255,255,255,0.5)',
              boxShadow: selectedCat === cat.id ? `0 4px 12px ${accentColor}40` : 'none',
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 pt-2 pb-1">
        <p className="text-[9px] text-white/25 font-bold uppercase tracking-wider">
          {filtered.length} themes{hasMore ? ` · showing ${visible.length}` : ''}
        </p>
      </div>

      {/* Theme grid */}
      <div className="flex-1 px-4 grid grid-cols-2 gap-3 pb-4">
        {visible.map(theme => {
          const locked = !isAdmin && theme.unlockLevel && userLevel < theme.unlockLevel;
          return (
            <ThemeCard
              key={theme.id}
              theme={theme}
              locked={!!locked}
              onSelect={() => setSelectedTheme(theme)}
              accentColor={accentColor}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm font-black text-white/30">No themes found</p>
            <p className="text-[10px] text-white/15 mt-1">Try different keywords</p>
          </div>
        )}
        {hasMore && (
          <div className="col-span-2 py-3">
            <button
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="w-full py-3 rounded-2xl text-xs font-black transition-all active:scale-95 border"
              style={{
                background: `${accentColor}15`,
                borderColor: `${accentColor}40`,
                color: accentColor,
              }}
            >
              Load More · {filtered.length - visible.length} remaining
            </button>
          </div>
        )}
      </div>

      {/* Theme Detail Modal */}
      {selectedTheme && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => { setSelectedTheme(null); setShowSchedulePanel(false); }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm mx-2 mb-4 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: '#0d0f1a', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Preview top bar */}
            <div
              className="relative h-28 flex flex-col justify-between p-4"
              style={{ background: `linear-gradient(135deg, ${selectedTheme.colors.topBarStart}, ${selectedTheme.colors.topBarEnd})` }}
            >
              {selectedTheme.topBarEffect && (
                <div className="absolute inset-0 overflow-hidden">
                  <TopBarEffectsLayer effects={[{
                    id: selectedTheme.topBarEffect,
                    enabled: true,
                    color: selectedTheme.animColor || selectedTheme.colors.accentGlow,
                    speed: selectedTheme.animSpeed,
                  }]} />
                </div>
              )}
              <div className="flex justify-between items-start relative z-10">
                <button
                  onClick={() => { setSelectedTheme(null); setShowSchedulePanel(false); }}
                  className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X size={12} className="text-white" />
                </button>
                <span
                  className="text-[8px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: `${RARITY_COLORS[selectedTheme.rarity]}30`, color: RARITY_COLORS[selectedTheme.rarity] }}
                >
                  {RARITY_LABELS[selectedTheme.rarity]}
                </span>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <span className="text-4xl">{selectedTheme.emoji}</span>
                <div>
                  <p className="text-sm font-black text-white">{selectedTheme.name}</p>
                  <p className="text-[9px] text-white/60">{selectedTheme.description}</p>
                </div>
              </div>
            </div>

            {/* Preview content area */}
            <div className="p-3" style={{ background: selectedTheme.colors.bgColor }}>
              <div className="grid grid-cols-3 gap-1.5">
                {['📚 Notes', '🎯 MCQ', '🏆 Rank'].map(label => (
                  <div
                    key={label}
                    className="rounded-xl p-2 text-center"
                    style={{ background: selectedTheme.colors.cardBg, border: `1px solid ${selectedTheme.colors.cardBorder}` }}
                  >
                    <p className="text-[8px] font-bold" style={{ color: selectedTheme.colors.textPrimary }}>{label}</p>
                  </div>
                ))}
              </div>
              <div
                className="mt-1.5 rounded-xl py-2 text-center"
                style={{ background: `linear-gradient(135deg, ${selectedTheme.colors.btnStart}, ${selectedTheme.colors.btnEnd})` }}
              >
                <p className="text-[8px] font-black text-white">⚡ Start Learning</p>
              </div>
            </div>

            {/* Nav preview */}
            <div
              className="flex border-t"
              style={{ background: selectedTheme.colors.navBg, borderColor: selectedTheme.colors.navBorder }}
            >
              {['🏠', '📖', '🎯', '👤'].map((icon, i) => (
                <div
                  key={icon}
                  className="flex-1 py-2 flex flex-col items-center gap-0.5"
                  style={{ opacity: i === 0 ? 1 : 0.35 }}
                >
                  <span className="text-[11px]">{icon}</span>
                  <div
                    className="h-0.5 w-3 rounded-full"
                    style={{ background: i === 0 ? selectedTheme.colors.navActive : 'transparent' }}
                  />
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              {/* Tags */}
              {selectedTheme.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTheme.tags.slice(0, 6).map(tag => (
                    <span
                      key={tag}
                      className="text-[8px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${accentColor}15`, color: accentColor }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Color palette */}
              <div className="flex items-center gap-1.5">
                <p className="text-[8px] text-white/25 mr-1">Colors:</p>
                {[
                  selectedTheme.colors.navActive,
                  selectedTheme.colors.btnStart,
                  selectedTheme.colors.btnEnd,
                  selectedTheme.colors.accentGlow,
                  selectedTheme.colors.progressColor,
                  selectedTheme.colors.cardBg,
                ].map((c, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-white/15 shadow"
                    style={{ background: c }}
                  />
                ))}
              </div>

              {/* Level requirement */}
              {selectedTheme.unlockLevel && selectedTheme.unlockLevel > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                  style={{
                    background: '#0f0a00',
                    borderColor: userLevel >= selectedTheme.unlockLevel ? '#15803d40' : '#92400e40',
                  }}
                >
                  {userLevel >= selectedTheme.unlockLevel ? (
                    <CheckCircle2 size={13} className="text-green-400" />
                  ) : (
                    <Lock size={13} className="text-amber-500" />
                  )}
                  <p className="text-[9px] font-bold" style={{ color: userLevel >= selectedTheme.unlockLevel ? '#4ade80' : '#fbbf24' }}>
                    {userLevel >= selectedTheme.unlockLevel
                      ? `Unlocked! (Lv.${selectedTheme.unlockLevel} required)`
                      : `Unlock at Level ${selectedTheme.unlockLevel} (You: Lv.${userLevel})`
                    }
                  </p>
                </div>
              )}

              {/* Effect badge */}
              {selectedTheme.isAnimated && selectedTheme.topBarEffect && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/8 bg-white/4">
                  <Zap size={11} className="text-yellow-400" />
                  <p className="text-[9px] font-bold text-white/60">Animated top bar effect included</p>
                </div>
              )}

              {/* Action buttons */}
              {isAdmin ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleApply(selectedTheme)}
                    className="w-full py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all"
                    style={{ background: `linear-gradient(135deg, ${selectedTheme.colors.btnStart}, ${selectedTheme.colors.btnEnd})` }}
                  >
                    🎨 Try — Apply to My Account
                  </button>
                  <button
                    onClick={() => setShowSchedulePanel(v => !v)}
                    className="w-full py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all border border-amber-500/30 flex items-center justify-center gap-2"
                    style={{ background: '#1a0f00' }}
                  >
                    <Calendar size={13} className="text-amber-400" />
                    <span>Schedule for All Users</span>
                    {showSchedulePanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleApply(selectedTheme)}
                  disabled={!!(selectedTheme.unlockLevel && userLevel < selectedTheme.unlockLevel)}
                  className="w-full py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: selectedTheme.unlockLevel && userLevel < selectedTheme.unlockLevel
                      ? '#1a0f00'
                      : `linear-gradient(135deg, ${selectedTheme.colors.btnStart}, ${selectedTheme.colors.btnEnd})`,
                  }}
                >
                  {selectedTheme.unlockLevel && userLevel < selectedTheme.unlockLevel
                    ? `🔒 Unlock at Level ${selectedTheme.unlockLevel}`
                    : '🎨 Apply Theme'}
                </button>
              )}

              {/* Admin schedule panel */}
              {isAdmin && showSchedulePanel && (
                <div
                  className="rounded-2xl p-4 border border-amber-500/20 space-y-3"
                  style={{ background: '#0f0a00' }}
                >
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={9} /> Schedule Theme for Users
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[9px] text-white/40 font-bold uppercase">Target Tier</label>
                      <div className="flex gap-1.5 mt-1">
                        {(['ALL', 'FREE', 'BASIC', 'ULTRA'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setSchedTarget(t)}
                            className="flex-1 py-1.5 rounded-xl text-[9px] font-black border transition-all active:scale-90"
                            style={{
                              background: schedTarget === t ? `${accentColor}25` : '#0d0f1a',
                              borderColor: schedTarget === t ? accentColor : 'rgba(255,255,255,0.08)',
                              color: schedTarget === t ? accentColor : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-white/40 font-bold uppercase">Start in (hours)</label>
                        <input
                          type="number"
                          min={0}
                          max={720}
                          value={schedDelay}
                          onChange={e => setSchedDelay(Number(e.target.value))}
                          className="mt-1 w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                        />
                        <p className="text-[7px] text-white/20 mt-0.5">0 = starts now</p>
                      </div>
                      <div>
                        <label className="text-[9px] text-white/40 font-bold uppercase">Duration (hours)</label>
                        <input
                          type="number"
                          min={1}
                          max={720}
                          value={schedHours}
                          onChange={e => setSchedHours(Number(e.target.value))}
                          className="mt-1 w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                          className="w-8 h-5 rounded-full relative transition-colors"
                          style={{ background: schedApplyProfile ? accentColor : '#334155' }}
                          onClick={() => setSchedApplyProfile(v => !v)}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                            style={{ left: schedApplyProfile ? '14px' : '2px' }}
                          />
                        </div>
                        <span className="text-[9px] text-white/50">Profile Bg</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                          className="w-8 h-5 rounded-full relative transition-colors"
                          style={{ background: schedApplyBg ? accentColor : '#334155' }}
                          onClick={() => setSchedApplyBg(v => !v)}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                            style={{ left: schedApplyBg ? '14px' : '2px' }}
                          />
                        </div>
                        <span className="text-[9px] text-white/50">App Bg</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSchedule}
                    className="w-full py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, #d97706, #c2410c)` }}
                  >
                    <Calendar size={13} />
                    Schedule Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeCard({ theme, locked, onSelect, accentColor }: {
  theme: AppTheme;
  locked: boolean;
  onSelect: () => void;
  accentColor: string;
}) {
  const rarityColor = RARITY_COLORS[theme.rarity];

  return (
    <button
      onClick={onSelect}
      className="rounded-2xl overflow-hidden border text-left active:scale-95 transition-all"
      style={{
        background: '#0d0f1a',
        borderColor: locked ? 'rgba(255,255,255,0.05)' : `${rarityColor}30`,
        opacity: locked ? 0.6 : 1,
      }}
    >
      {/* Color preview */}
      <div
        className="relative h-14"
        style={{ background: `linear-gradient(135deg, ${theme.colors.topBarStart}, ${theme.colors.topBarEnd})` }}
      >
        {theme.isAnimated && theme.topBarEffect && !locked && (
          <div className="absolute inset-0 overflow-hidden">
            <TopBarEffectsLayer effects={[{
              id: theme.topBarEffect,
              enabled: true,
              color: theme.animColor || theme.colors.accentGlow,
              speed: (theme.animSpeed || 1) * 0.7,
            }]} />
          </div>
        )}
        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Lock size={16} className="text-amber-400" />
          </div>
        )}
        {/* Rarity badge */}
        <div
          className="absolute top-1.5 right-1.5 text-[6px] font-black px-1.5 py-0.5 rounded-full"
          style={{ background: `${rarityColor}30`, color: rarityColor }}
        >
          {RARITY_LABELS[theme.rarity].slice(0, 1)}
        </div>
        {/* Mini color dots */}
        <div className="absolute bottom-1.5 left-1.5 flex gap-1">
          {[theme.colors.navActive, theme.colors.btnStart, theme.colors.accentGlow].map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-[10px] font-black text-white truncate">{theme.emoji} {theme.name}</p>
            <p className="text-[8px] text-white/30 truncate mt-0.5">{theme.description}</p>
          </div>
        </div>
        {locked && theme.unlockLevel && (
          <div className="flex items-center gap-1 mt-1.5">
            <Lock size={8} className="text-amber-400" />
            <p className="text-[7px] font-bold text-amber-400">Lv.{theme.unlockLevel}</p>
          </div>
        )}
        {theme.isAnimated && (
          <div className="flex items-center gap-1 mt-1">
            <Zap size={7} className="text-yellow-400" />
            <p className="text-[7px] text-yellow-400 font-bold">Animated</p>
          </div>
        )}
      </div>
    </button>
  );
}
