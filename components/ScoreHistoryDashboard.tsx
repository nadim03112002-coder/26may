import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, TrendingUp, Award, Calendar, Zap } from "lucide-react";
import { getScoreLog, ScoreLogEntry } from "../utils/scoreSystem";
import { getLevelInfo } from "../utils/levelSystem";

interface Props {
  user: { id: string; totalScore?: number; subscriptionLevel?: string; isPremium?: boolean };
  onBack: () => void;
}

const ACTIVITY_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  MCQ_CORRECT:  { emoji: '✅', label: 'MCQ Sahi Jawab',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  MCQ_WRONG:    { emoji: '🔵', label: 'MCQ Koshish',       color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  MCQ_STREAK_3: { emoji: '🔥', label: 'Streak Bonus 3x',   color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  MCQ_STREAK_5: { emoji: '⚡', label: 'Streak Bonus 5x',   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
  VIDEO:        { emoji: '📹', label: 'Video / Audio',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  PDF:          { emoji: '📄', label: 'Notes / PDF',       color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  MILESTONE:    { emoji: '🏁', label: 'Milestone Bonus',   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'   },
  DAILY_LOGIN:  { emoji: '📅', label: 'Daily Login',       color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  CREDIT_SPEND: { emoji: '🪙', label: 'Credit Kharcha',    color: '#eab308', bg: 'rgba(234,179,8,0.12)'   },
  REDEEM_CODE:  { emoji: '🎟️', label: 'Redeem Code',      color: '#ec4899', bg: 'rgba(236,72,153,0.12)'  },
  SUBSCRIPTION: { emoji: '👑', label: 'Subscription Bonus',color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  OTHER:        { emoji: '⭐', label: 'Anya Activity',     color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const getMeta = (activity: string) => ACTIVITY_META[activity] ?? ACTIVITY_META['OTHER'];

const fmt = (n: number) => n.toLocaleString('en-IN');

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Aaj';
  if (dateStr === yesterday) return 'Kal';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
};

export const ScoreHistoryDashboard: React.FC<Props> = ({ user, onBack }) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['today']));

  const log = useMemo(() => getScoreLog(user.id), [user.id]);

  const today = new Date().toISOString().split('T')[0];
  const todayKey = today;

  const dayMap = useMemo(() => {
    const m: Record<string, { total: number; entries: ScoreLogEntry[]; activities: Record<string, number> }> = {};
    for (const e of log) {
      if (!m[e.date]) m[e.date] = { total: 0, entries: [], activities: {} };
      m[e.date].total += e.pts;
      m[e.date].entries.push(e);
      m[e.date].activities[e.activity] = (m[e.date].activities[e.activity] || 0) + e.pts;
    }
    return m;
  }, [log]);

  const sortedDays = useMemo(() =>
    Object.keys(dayMap).sort((a, b) => b.localeCompare(a)).slice(0, 30),
  [dayMap]);

  const chartDays = useMemo(() => {
    const days: { date: string; pts: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      days.push({ date: d, pts: dayMap[d]?.total ?? 0 });
    }
    return days;
  }, [dayMap]);

  const maxChartPts = Math.max(...chartDays.map(d => d.pts), 1);

  const thisWeekTotal = useMemo(() => {
    let t = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      t += dayMap[d]?.total ?? 0;
    }
    return t;
  }, [dayMap]);

  const bestDay = useMemo(() => {
    let best = { date: '', pts: 0 };
    for (const [date, data] of Object.entries(dayMap)) {
      if (data.total > best.pts) best = { date, pts: data.total };
    }
    return best;
  }, [dayMap]);

  const allTimeTotal = useMemo(() => log.reduce((s, e) => s + e.pts, 0), [log]);

  const topActivity = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of log) totals[e.activity] = (totals[e.activity] || 0) + e.pts;
    let top = { activity: '', pts: 0 };
    for (const [a, p] of Object.entries(totals)) if (p > top.pts) top = { activity: a, pts: p };
    return top;
  }, [log]);

  const currentLevel = getLevelInfo(user.totalScore || 0);

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  };

  const noData = log.length === 0;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a12', color: '#e2e8f0' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b"
        style={{ background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ChevronLeft size={18} color="#94a3b8" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-base leading-none">📊 Score History</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Tera score ka full record</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">Level</p>
          <p className="text-sm font-black" style={{ color: currentLevel.color }}>{currentLevel.emoji} L{currentLevel.level}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-20">

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Calendar size={14} />, label: 'Is Hafte', value: `+${fmt(thisWeekTotal)} pts`, color: '#3b82f6' },
            { icon: <Award size={14} />, label: 'Best Din', value: bestDay.pts > 0 ? `+${fmt(bestDay.pts)} pts` : '—', color: '#f59e0b' },
            { icon: <TrendingUp size={14} />, label: 'Kul (Logged)', value: `+${fmt(allTimeTotal)} pts`, color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-center mb-1.5" style={{ color: s.color }}>{s.icon}</div>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-[11px] font-black text-white mt-0.5 leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Top Activity */}
        {topActivity.activity && (
          <div className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: getMeta(topActivity.activity).bg, border: `1px solid ${getMeta(topActivity.activity).color}30` }}>
            <span className="text-xl shrink-0">{getMeta(topActivity.activity).emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400">Sabse zyada score kahan se mila</p>
              <p className="text-sm font-black text-white">{getMeta(topActivity.activity).label}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500">Total</p>
              <p className="text-sm font-black" style={{ color: getMeta(topActivity.activity).color }}>+{fmt(topActivity.pts)} pts</p>
            </div>
          </div>
        )}

        {/* Bar Chart — last 14 days */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={12} color="#fbbf24" />
            <p className="text-[10px] font-black text-white uppercase tracking-wider">Pichle 14 Din</p>
          </div>
          <div className="flex items-end gap-1 h-20">
            {chartDays.map(d => {
              const h = d.pts > 0 ? Math.max(4, Math.round((d.pts / maxChartPts) * 72)) : 2;
              const isToday = d.date === today;
              const dayLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric' });
              return (
                <div key={d.date} className="flex flex-col items-center flex-1 gap-1">
                  <div className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${h}px`,
                      background: isToday
                        ? 'linear-gradient(180deg, #fbbf24, #f59e0b)'
                        : d.pts > 0
                          ? 'linear-gradient(180deg, #3b82f6aa, #1d4ed8aa)'
                          : 'rgba(255,255,255,0.06)',
                    }} />
                  <p className="text-[7px] text-slate-600 leading-none" style={{ color: isToday ? '#fbbf24' : undefined }}>{dayLabel}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-[8px] text-slate-600">14 din pehle</p>
            <p className="text-[8px] text-amber-500">Aaj</p>
          </div>
        </div>

        {/* Day-by-day List */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Din ka Hisab</p>

          {noData ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-3xl mb-2">📊</p>
              <p className="font-black text-white text-sm">Abhi koi data nahi</p>
              <p className="text-[11px] text-slate-500 mt-1">MCQ karo, Video dekho, Login karo — yahan history dikhne lagegi!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedDays.map(date => {
                const data = dayMap[date];
                const isExpanded = expandedDays.has(date);
                const isToday = date === todayKey;

                const activityGroups = Object.entries(data.activities)
                  .sort((a, b) => b[1] - a[1]);

                return (
                  <div key={date} className="rounded-2xl overflow-hidden"
                    style={{ background: isToday ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isToday ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)'}` }}>

                    {/* Day header */}
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors"
                      onClick={() => toggleDay(date)}>
                      <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                        style={{ background: isToday ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)' }}>
                        <p className="text-[8px] font-black uppercase" style={{ color: isToday ? '#fbbf24' : '#64748b' }}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                        </p>
                        <p className="text-sm font-black" style={{ color: isToday ? '#fbbf24' : '#94a3b8' }}>
                          {new Date(date + 'T00:00:00').getDate()}
                        </p>
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <p className="font-black text-white text-sm">{formatDate(date)}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {activityGroups.slice(0, 3).map(([act]) => (
                            <span key={act} className="text-[9px]">{getMeta(act).emoji}</span>
                          ))}
                          {activityGroups.length > 3 && (
                            <span className="text-[8px] text-slate-600">+{activityGroups.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-sm" style={{ color: isToday ? '#fbbf24' : '#22c55e' }}>+{fmt(data.total)}</p>
                        <p className="text-[9px] text-slate-500">pts</p>
                      </div>

                      {isExpanded
                        ? <ChevronUp size={14} color="#475569" className="shrink-0" />
                        : <ChevronDown size={14} color="#475569" className="shrink-0" />
                      }
                    </button>

                    {/* Expanded activity breakdown */}
                    {isExpanded && (
                      <div className="px-4 pb-3.5 space-y-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider pt-2.5 mb-2">Activity Breakdown</p>
                        {activityGroups.map(([act, pts]) => {
                          const meta = getMeta(act);
                          const count = data.entries.filter(e => e.activity === act).length;
                          return (
                            <div key={act} className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                              style={{ background: meta.bg }}>
                              <span className="text-base shrink-0">{meta.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-white">{meta.label}</p>
                                <p className="text-[9px]" style={{ color: meta.color }}>{count}× activity</p>
                              </div>
                              <p className="font-black text-sm shrink-0" style={{ color: meta.color }}>+{fmt(pts)}</p>
                            </div>
                          );
                        })}

                        {/* Hourly timeline — last 5 entries of the day */}
                        {data.entries.length > 0 && (
                          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <p className="text-[9px] text-slate-600 mb-1.5">Recent Activity</p>
                            <div className="space-y-1">
                              {[...data.entries].sort((a, b) => b.ts - a.ts).slice(0, 8).map((e, i) => {
                                const meta = getMeta(e.activity);
                                const time = new Date(e.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                return (
                                  <div key={i} className="flex items-center gap-2">
                                    <p className="text-[8px] text-slate-600 w-10 shrink-0">{time}</p>
                                    <span className="text-[10px]">{meta.emoji}</span>
                                    <p className="text-[9px] text-slate-400 flex-1">{meta.label}</p>
                                    <p className="text-[9px] font-black" style={{ color: meta.color }}>+{e.pts}</p>
                                  </div>
                                );
                              })}
                              {data.entries.length > 8 && (
                                <p className="text-[8px] text-slate-600 text-center">... aur {data.entries.length - 8} activity</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Level Info Card */}
        <div className="rounded-2xl p-4"
          style={{ background: `${currentLevel.color}10`, border: `1px solid ${currentLevel.color}30` }}>
          <p className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: currentLevel.color }}>Tera Current Level</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentLevel.emoji}</span>
            <div>
              <p className="font-black text-white">{currentLevel.label} · Level {currentLevel.level}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Total Score: {fmt(user.totalScore || 0)} pts</p>
            </div>
            {currentLevel.discount > 0 && (
              <div className="ml-auto text-right">
                <p className="text-[9px] text-slate-500">Store Discount</p>
                <p className="font-black" style={{ color: currentLevel.color }}>{currentLevel.discount}% OFF</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScoreHistoryDashboard;
