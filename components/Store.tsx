import React, { useState, useEffect } from 'react';
import { User, CreditPackage, SystemSettings } from '../types';
import {
  Sparkles, Check, MessageSquare, Lock, Ticket, ShieldCheck, Star,
  ChevronRight, Flame, BadgeCheck, History, TrendingDown,
  Calendar, Clock, Crown, DollarSign, ArrowLeft, Zap, Gift, Coins,
  Package
} from 'lucide-react';
import { getLevelInfo, getNextLevelInfo, getLevelProgress, getScoreDiscountFromScore } from '../utils/levelSystem';

interface Props {
  user: User;
  settings?: SystemSettings;
  onUserUpdate: (user: User) => void;
  renderEarnContent?: React.ReactNode;
  onBack?: () => void;
  themeColor?: string;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '99,102,241';
  return `${r},${g},${b}`;
}

/* ─── Subscription History ─── */
const SubHistory: React.FC<{ user: User; onBack: () => void; themeColor?: string }> = ({ user, onBack, themeColor }) => {
  const history = user.subscriptionHistory || [];
  const totalPaid = history.reduce((s, i) => s + i.price, 0);
  const totalFree = history.reduce((s, i) => i.isFree ? s + i.originalPrice : s, 0);
  const sorted = [...history].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const rgb = hexToRgb(themeColor || '#6366f1');

  return (
    <div className="min-h-screen pb-28 animate-in fade-in slide-in-from-right duration-300" style={{ background: `linear-gradient(180deg, rgba(${rgb},0.06) 0%, #0a0a0a 35%)` }}>
      <div className="relative overflow-hidden px-4 pt-5 pb-6" style={{ background: `linear-gradient(135deg, rgba(${rgb},0.18) 0%, rgba(${rgb},0.06) 60%, transparent 100%), #0d0d14` }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, rgba(${rgb},0.22) 0%, transparent 60%)` }} />
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white">Subscription History</h2>
            <p className="text-[11px] text-indigo-300 font-medium">Plan & Payment Records</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {history.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <TrendingDown size={15} className="text-emerald-400" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">You Paid</span>
              </div>
              <p className="text-2xl font-black text-white">₹{totalPaid}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Total Spend</p>
            </div>
            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.25)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <Gift size={15} className="text-indigo-400" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Free Value</span>
              </div>
              <p className="text-2xl font-black text-indigo-400">₹{totalFree}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Gifts & Rewards</p>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-black text-slate-400 text-xs flex items-center gap-2 mb-3 uppercase tracking-widest">
            <History size={14} /> Recent Activity
          </h3>
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <Crown size={40} className="mx-auto mb-3 text-slate-700" />
              <p className="font-bold text-slate-500 text-sm">Koi history nahi mili</p>
              <p className="text-xs text-slate-600 mt-1">Pehli plan lo — yahan record aayega</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.isFree ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
                        {item.isFree ? <Gift size={18} /> : <DollarSign size={18} />}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">
                          {item.tier === 'LIFETIME' ? 'Lifetime Access' : `${item.durationHours < 24 ? item.durationHours + ' Hours' : Math.ceil(item.durationHours / 24) + ' Days'} Plan`}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">{item.level} · {item.grantSource}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black text-sm ${item.isFree ? 'text-emerald-400' : 'text-white'}`}>
                        {item.isFree ? 'FREE' : `₹${item.price}`}
                      </p>
                      {item.isFree && <p className="text-[10px] text-slate-600 line-through">₹{item.originalPrice}</p>}
                    </div>
                  </div>
                  <div className="rounded-xl p-3 flex justify-between items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Calendar size={11} />
                      <span>{new Date(item.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock size={11} />
                      <span>{item.tier === 'LIFETIME' ? 'Forever' : new Date(item.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Store ─── */
export const Store: React.FC<Props> = ({ user, settings, renderEarnContent, onBack, themeColor }) => {
  const rgb = hexToRgb(themeColor || '#6366f1');
  const [tierType, setTierType] = useState<'BASIC' | 'ULTRA' | 'EARN' | 'CREDITS'>('BASIC');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const packages = settings?.packages || [];
  const subscriptionPlans = settings?.subscriptionPlans || [];

  const totalScore = user.totalScore || 0;
  const scoreDiscount = getScoreDiscountFromScore(totalScore);
  const scoreTier = getLevelInfo(totalScore);

  const activeStoreDiscount =
    (user.storeDiscount && user.storeDiscount > 0 && scoreTier.level <= 4 && totalScore >= 100)
      ? user.storeDiscount : 0;

  const [visitCount, setVisitCount] = useState<number>(0);
  const visitDiscountRules = settings?.storeVisitDiscountRules || [];
  const visitDiscountEnabled = !!(settings?.storeVisitDiscountEnabled && visitDiscountRules.length > 0);
  const userSubTier: 'FREE' | 'BASIC' | 'ULTRA' =
    (user as any).subscriptionLevel === 'ULTRA' ? 'ULTRA'
    : (user as any).subscriptionLevel === 'BASIC' ? 'BASIC' : 'FREE';
  const eligibleTiers: ('FREE' | 'BASIC' | 'ULTRA')[] = settings?.storeVisitDiscountTiers || ['FREE'];
  const isEligibleForVisitDiscount = visitDiscountEnabled && eligibleTiers.includes(userSubTier);
  const visitDiscount = isEligibleForVisitDiscount
    ? (visitDiscountRules.filter(r => visitCount >= r.visits).sort((a, b) => b.discountPercent - a.discountPercent)[0]?.discountPercent || 0)
    : 0;
  const nextVisitRule = isEligibleForVisitDiscount
    ? visitDiscountRules.filter(r => r.visits > visitCount).sort((a, b) => a.visits - b.visits)[0]
    : null;

  useEffect(() => {
    if (!visitDiscountEnabled) return;
    const key = `store_visit_total_${user.id}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(prev + 1));
    setVisitCount(prev + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEffect(() => {
    if (subscriptionPlans.length > 0 && !selectedPlanId) {
      const defaultPlan = subscriptionPlans.find(p => p.name.includes('Monthly')) || subscriptionPlans[0];
      setSelectedPlanId(defaultPlan.id);
    }
  }, [subscriptionPlans]);

  const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<any>(null);

  const event = settings?.specialDiscountEvent;
  const isSubscribed = user.isPremium && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date();

  const isEventActive = () => {
    if (!event?.enabled) return false;
    const now = Date.now();
    if (!event.startsAt && !event.endsAt) return true;
    const startsAt = event.startsAt ? new Date(event.startsAt).getTime() : 0;
    const endsAt = event.endsAt ? new Date(event.endsAt).getTime() : Infinity;
    if (startsAt === endsAt) return now >= startsAt;
    return now >= startsAt && now < endsAt;
  };
  const isCooldownPhase = () => {
    if (!event?.enabled || !event.startsAt) return false;
    return Date.now() < new Date(event.startsAt).getTime();
  };
  const activeEvent = isEventActive();
  const inCooldown = isCooldownPhase();
  const showEventBanner = activeEvent || inCooldown;

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  useEffect(() => {
    if (!event?.enabled || (!event?.startsAt && !event?.endsAt)) { setTimeLeft(null); return; }
    const calc = () => {
      const now = Date.now();
      const start = event.startsAt ? new Date(event.startsAt).getTime() : 0;
      const end   = event.endsAt   ? new Date(event.endsAt).getTime()   : 0;
      let diff = 0;
      if (now < start) diff = start - now;
      else if (start === end && now >= start) { setTimeLeft(null); return; }
      else if (now < end) diff = end - now;
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({ days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [event]);

  const handleSupportClick = (numEntry: any) => {
    if (!purchaseItem) return;
    const isSub = purchaseItem.duration !== undefined;
    let price = isSub
      ? (purchaseItem.finalPrice !== undefined ? purchaseItem.finalPrice : (tierType === 'BASIC' ? purchaseItem.basicPrice : purchaseItem.ultraPrice))
      : purchaseItem.price;
    const features = isSub ? (tierType === 'BASIC' ? 'MCQ + Notes (Pro)' : 'PDF + Videos + AI Studio (Max)') : `${purchaseItem.credits} Credits`;
    const msg = `Hello Admin, I want to buy:\n\nItem: ${purchaseItem.name} ${isSub ? `(${tierType === 'BASIC' ? 'PRO' : 'MAX'})` : ''}\nPrice: ₹${price}\nUser ID: ${user.id}\nDetails: ${features}\n\nPlease share payment details.`;
    window.open(`https://wa.me/91${numEntry.number}?text=${encodeURIComponent(msg)}`, '_blank');
    setShowSupportModal(false);
  };
  const initiatePurchase = (item: any) => { setPurchaseItem(item); setShowSupportModal(true); };

  if (showHistory) return <SubHistory user={user} onBack={() => setShowHistory(false)} themeColor={themeColor} />;

  if (settings?.isPaymentEnabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(180deg, rgba(${rgb},0.07) 0%, #0a0a0a 40%)` }}>
        <div className="rounded-3xl p-10 text-center max-w-sm w-full" style={{ background: `rgba(${rgb},0.06)`, border: `1px solid rgba(${rgb},0.2)` }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `rgba(${rgb},0.15)` }}>
            <Lock size={32} style={{ color: `rgba(${rgb},1)` }} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Store Locked</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            {settings.paymentDisabledMessage || 'Purchases are currently disabled by the Admin.'}
          </p>
        </div>
      </div>
    );
  }

  const defaultBasicFeatures = ['Full MCQs Unlocked','Premium Notes (Standard)','Audio Library','AI Videos (2D Basic)','Team Support'];
  const defaultUltraFeatures = ['Everything in Basic','Premium Notes (Deep Dive)','Ultra Podcast (Studio HD)','AI Videos (2D + 3D)','Competitive Mode 🏆'];
  const featuresList = tierType === 'BASIC'
    ? (settings?.storeFeatures?.basic?.filter(f => f.trim()) || defaultBasicFeatures)
    : (settings?.storeFeatures?.ultra?.filter(f => f.trim()) || defaultUltraFeatures);

  const getPerMonthPrice = (plan: any, price: number) => {
    if (plan.duration.toLowerCase().includes('year') || plan.duration.includes('365')) return Math.round(price / 12);
    return null;
  };

  const isPro = tierType === 'BASIC';
  const isGameEnabled = settings?.isGameEnabled !== false;

  const PA = {
    cyanBorder:  'rgba(6,182,212,0.5)',
    cyanBg:      'rgba(6,182,212,0.10)',
    cyanGlow:    'rgba(6,182,212,0.20)',
    cyanText:    '#67e8f9',
    cyanGrad:    'linear-gradient(135deg,#0891b2,#06b6d4)',
    cyanPill:    'rgba(6,182,212,0.25)',
    violetBorder:'rgba(139,92,246,0.5)',
    violetBg:    'rgba(139,92,246,0.10)',
    violetGlow:  'rgba(139,92,246,0.20)',
    violetText:  '#c4b5fd',
    violetGrad:  'linear-gradient(135deg,#7c3aed,#8b5cf6)',
    violetPill:  'rgba(139,92,246,0.25)',
  };
  const ac = {
    border:  isPro ? PA.cyanBorder  : PA.violetBorder,
    bg:      isPro ? PA.cyanBg      : PA.violetBg,
    glow:    isPro ? PA.cyanGlow    : PA.violetGlow,
    text:    isPro ? PA.cyanText    : PA.violetText,
    grad:    isPro ? PA.cyanGrad    : PA.violetGrad,
    pill:    isPro ? PA.cyanPill    : PA.violetPill,
    label:   isPro ? 'PRO'          : 'MAX',
    emoji:   isPro ? '⭐'           : '⚡',
  };

  const allTabs = [
    { id: 'BASIC'   as const, label: 'Pro',     icon: '⭐', activeBg: 'rgba(6,182,212,0.18)',   activeBorder: 'rgba(6,182,212,0.6)',   activeText: '#67e8f9' },
    { id: 'ULTRA'   as const, label: 'Max',     icon: '⚡', activeBg: 'rgba(139,92,246,0.18)',  activeBorder: 'rgba(139,92,246,0.6)',  activeText: '#c4b5fd' },
    ...(packages.length > 0 ? [{ id: 'CREDITS' as const, label: 'Credits', icon: '🪙', activeBg: 'rgba(245,158,11,0.18)',  activeBorder: 'rgba(245,158,11,0.6)',  activeText: '#fcd34d' }] : []),
    ...(isGameEnabled ? [{ id: 'EARN' as const, label: 'Earn', icon: '🎰', activeBg: 'rgba(16,185,129,0.18)', activeBorder: 'rgba(16,185,129,0.6)', activeText: '#6ee7b7' }] : []),
  ];

  const totalDiscount = (() => {
    let d = 0;
    if (activeEvent && event?.discountPercent) d += event.discountPercent;
    if (isSubscribed) d += 5;
    if (activeStoreDiscount > 0) d += activeStoreDiscount;
    if (scoreDiscount > 0) d += scoreDiscount;
    if (visitDiscount > 0) d += visitDiscount;
    return Math.min(d, 100);
  })();

  return (
    <div className="min-h-screen pb-28 font-sans animate-in fade-in duration-300" style={{ background: `linear-gradient(180deg, rgba(${rgb},0.07) 0%, #0a0a0a 30%)` }}>

      {/* ── SUPPORT MODAL ── */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="rounded-3xl w-full max-w-lg overflow-hidden border border-white/10 animate-in slide-in-from-bottom-4" style={{ background: '#111' }}>
            <div className="px-5 pt-5 pb-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: ac.bg, border: `1px solid ${ac.border}` }}>
                  <MessageSquare size={18} style={{ color: ac.text }} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Support Channel Chuno</h3>
                  <p className="text-[11px] text-slate-500">Payment ke liye ek number select karo</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2">
              {(settings?.paymentNumbers || [{ id: 'def', name: 'Main Support', number: '8227070298', dailyClicks: 0 }]).map((num) => {
                const totalClicks = settings?.paymentNumbers?.reduce((acc, curr) => acc + (curr.dailyClicks || 0), 0) || 1;
                const traffic = Math.round(((num.dailyClicks || 0) / totalClicks) * 100);
                const isGreen = traffic < 30;
                return (
                  <button key={num.id} onClick={() => handleSupportClick(num)}
                    className="w-full p-3.5 rounded-2xl flex justify-between items-center transition-all group active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isGreen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {num.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{num.name}</p>
                        <p className="text-[10px] text-slate-500">{isGreen ? '✅ Fast Response' : '⚠️ High Traffic'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isGreen ? 'text-emerald-400 bg-emerald-500/15' : 'text-orange-400 bg-orange-500/15'}`}>{traffic}% Busy</span>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="px-4 pb-5 pt-1">
              <button onClick={() => setShowSupportModal(false)} className="w-full py-3 text-slate-600 font-bold text-sm hover:text-white transition-colors rounded-xl hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ HEADER ══════════ */}
      <div className="relative overflow-hidden px-4 pt-5 pb-5"
        style={{ background: `linear-gradient(160deg, rgba(${rgb},0.18) 0%, rgba(${rgb},0.06) 55%, transparent 100%), #0d0d14` }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at top right, rgba(${rgb},0.20) 0%, transparent 55%)`
        }} />

        {onBack && (
          <div className="relative z-10 mb-3">
            <button onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <ArrowLeft size={15} className="text-white" />
              <span className="text-xs font-black text-white">Back</span>
            </button>
          </div>
        )}

        {/* Store / History toggle */}
        <div className="relative z-10 flex gap-2 mb-4 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button onClick={() => setShowHistory(false)}
            className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
            style={!showHistory
              ? { background: 'rgba(255,255,255,0.12)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
              : { color: 'rgba(255,255,255,0.45)' }}>
            🛒 Store
          </button>
          <button onClick={() => setShowHistory(true)}
            className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
            style={showHistory
              ? { background: 'rgba(255,255,255,0.12)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
              : { color: 'rgba(255,255,255,0.45)' }}>
            📋 History
          </button>
        </div>

        {/* Title row */}
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white leading-none tracking-tight">Premium Store</h1>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Plan upgrade karo — sab kuch unlock karo</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {/* Coin balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <span className="text-sm">🪙</span>
              <span className="font-black text-sm" style={{ color: '#fcd34d' }}>
                {((user.credits ?? 0) + (user.bonusCredits ?? 0)).toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] font-bold" style={{ color: 'rgba(252,211,77,0.6)' }}>CR</span>
              {(user.bonusCredits ?? 0) > 0 && (
                <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/20 px-1 rounded-full">+{user.bonusCredits}🎁</span>
              )}
            </div>
            {/* Active plan badge */}
            {user.isPremium && (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{
                    background: user.subscriptionLevel === 'ULTRA' ? 'rgba(139,92,246,0.2)' : 'rgba(6,182,212,0.2)',
                    color: user.subscriptionLevel === 'ULTRA' ? '#c4b5fd' : '#67e8f9',
                    border: `1px solid ${user.subscriptionLevel === 'ULTRA' ? 'rgba(139,92,246,0.4)' : 'rgba(6,182,212,0.4)'}`,
                  }}>
                  {user.subscriptionLevel === 'ULTRA' ? '⚡ ULTRA' : '★ BASIC'} Active
                </span>
                {user.subscriptionEndDate && (() => {
                  const end = new Date(user.subscriptionEndDate);
                  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
                  return days > 0
                    ? <span className="text-[9px] text-slate-600 font-bold">{days}d left</span>
                    : null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div className="px-4 pt-4">

        {/* ── TAB BAR ── */}
        <div className={`grid gap-2 mb-4 ${allTabs.length === 2 ? 'grid-cols-2' : allTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {allTabs.map(tab => {
            const isActive = tierType === tab.id;
            return (
              <button key={tab.id} onClick={() => setTierType(tab.id)}
                className="py-3 px-1 rounded-2xl text-[11px] font-black transition-all flex flex-col items-center gap-1 relative overflow-hidden"
                style={isActive
                  ? { background: tab.activeBg, border: `1.5px solid ${tab.activeBorder}`, color: tab.activeText, boxShadow: `0 0 12px ${tab.activeBg}` }
                  : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                <span className="text-lg leading-none">{tab.icon}</span>
                <span className="leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── DISCOUNT BANNERS — only show when something is actually active ── */}
        {totalDiscount > 0 && (
          <div className="mb-4 space-y-2 animate-in fade-in">
            {/* Event banner */}
            {showEventBanner && (
              <div className="p-4 rounded-2xl border"
                style={activeEvent
                  ? { background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(234,88,12,0.08))', borderColor: 'rgba(245,158,11,0.4)' }
                  : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeEvent ? '🔥' : '⏳'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-black" style={{ color: activeEvent ? '#fcd34d' : '#cbd5e1' }}>
                      {activeEvent
                        ? `${event?.eventName || 'Flash Sale'} — ${event?.discountPercent || 0}% OFF!`
                        : `${event?.eventName || 'Sale'} — Jald aane wala hai!`}
                    </p>
                    {activeEvent && (
                      <p className="text-[11px] mt-0.5" style={{ color: '#fb923c' }}>Sabhi plans pe discount apply!</p>
                    )}
                  </div>
                </div>
                {timeLeft && (
                  <div className="flex gap-2 mt-3 justify-center">
                    {timeLeft.days > 0 && (
                      <div className="rounded-xl px-3 py-1.5 text-center min-w-[48px]" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-base font-black text-white font-mono leading-none">{String(timeLeft.days).padStart(2,'0')}</p>
                        <p className="text-[8px] text-slate-500 uppercase mt-0.5">Days</p>
                      </div>
                    )}
                    {[{v:timeLeft.hours,l:'Hrs'},{v:timeLeft.minutes,l:'Min'},{v:timeLeft.seconds,l:'Sec'}].map(t => (
                      <div key={t.l} className="rounded-xl px-3 py-1.5 text-center min-w-[48px]" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-base font-black text-white font-mono leading-none">{String(t.v).padStart(2,'0')}</p>
                        <p className="text-[8px] text-slate-500 uppercase mt-0.5">{t.l}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Personal / visit / score discount combined */}
            {(activeStoreDiscount > 0 || visitDiscount > 0 || scoreDiscount > 0) && (
              <div className="p-3.5 rounded-2xl flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <Ticket size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-emerald-400">Discount Active 🎉</p>
                  <div className="flex gap-1.5 mt-0.5 flex-wrap">
                    {activeStoreDiscount > 0 && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">+{activeStoreDiscount}% Personal</span>}
                    {visitDiscount > 0 && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">+{visitDiscount}% Visit</span>}
                    {scoreDiscount > 0 && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">+{scoreDiscount}% Level</span>}
                  </div>
                </div>
                <span className="shrink-0 text-base font-black" style={{ color: '#6ee7b7' }}>{totalDiscount}% OFF</span>
              </div>
            )}
          </div>
        )}

        {/* ── EARN TAB ── */}
        {tierType === 'EARN' && isGameEnabled && (
          <div className="animate-in fade-in duration-200">
            {renderEarnContent ?? (
              <div className="text-center py-12 text-slate-500 font-bold">
                <p className="text-2xl mb-2">🎰</p>
                <p>Earn content loading...</p>
              </div>
            )}
          </div>
        )}

        {/* ── CREDITS TAB ── */}
        {tierType === 'CREDITS' && packages.length > 0 && (
          <div className="animate-in fade-in duration-200 space-y-2.5">
            {packages.map((pkg) => {
              let finalPrice = pkg.price;
              let disc = totalDiscount;
              if (disc > 0) finalPrice = Math.round(finalPrice * (1 - disc / 100));
              const perCredit = finalPrice > 0 ? (finalPrice / pkg.credits).toFixed(2) : '0';
              const isPopular = pkg.credits === 500;
              return (
                <button key={pkg.id} onClick={() => initiatePurchase(pkg)}
                  className="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
                  style={isPopular
                    ? { background: 'linear-gradient(135deg,rgba(245,158,11,0.14),rgba(234,88,12,0.08))', border: '1.5px solid rgba(245,158,11,0.45)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {isPopular && (
                    <div className="absolute top-0 right-0 text-black text-[8px] font-black px-2.5 py-1 rounded-bl-xl rounded-tr-xl" style={{ background: '#f59e0b' }}>POPULAR</div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>🪙</div>
                      <div>
                        <p className="text-sm font-black text-white">{pkg.credits.toLocaleString('en-IN')} Credits</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">₹{perCredit}/credit</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5">
                        {disc > 0 && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>
                            {disc}% OFF
                          </span>
                        )}
                        <p className="text-base font-black text-white">₹{finalPrice.toLocaleString('en-IN')}</p>
                      </div>
                      {disc > 0 && <p className="text-[9px] text-slate-700 line-through text-right">₹{pkg.price.toLocaleString('en-IN')}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="flex justify-center gap-5 mt-2">
              {[{icon:<ShieldCheck size={12}/>,text:'Secure'},{icon:<Zap size={12}/>,text:'Instant'},{icon:<Star size={12}/>,text:'Never Expire'}].map(b=>(
                <div key={b.text} className="flex items-center gap-1 text-[10px] text-slate-600 font-bold">{b.icon}<span>{b.text}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRO / MAX PLANS ── */}
        {tierType !== 'EARN' && tierType !== 'CREDITS' && (
          <>
            {subscriptionPlans.length === 0 ? (
              /* No plans configured — clean empty state */
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Package size={28} className="text-slate-600" />
                </div>
                <p className="font-black text-slate-400 text-base mb-1">Plans Coming Soon</p>
                <p className="text-[12px] text-slate-600 leading-relaxed">Admin jald hi plans add karega.<br />Baad mein dobara check karo.</p>
              </div>
            ) : (
              <>
                {/* Plan hero features card */}
                <div className="mb-4 rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: ac.bg, border: `1.5px solid ${ac.border}` }}>
                  <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
                    style={{ background: ac.glow, filter: 'blur(24px)' }} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mb-1.5"
                          style={{ background: ac.pill, color: ac.text, border: `1px solid ${ac.border}` }}>
                          {ac.emoji} {ac.label}
                        </span>
                        <p className="text-xl font-black leading-none" style={{ color: ac.text }}>
                          {isPro ? 'Pro Plan' : 'Max Plan'}
                        </p>
                      </div>
                      {isSubscribed && (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 rounded-xl flex items-center gap-1 shrink-0 self-start">
                          <BadgeCheck size={10} /> Active
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {featuresList.map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: ac.pill }}>
                            <Check size={9} style={{ color: ac.text }} strokeWidth={3} />
                          </div>
                          <span className="text-[12px] text-slate-400 font-medium leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing plans */}
                <div className="space-y-2.5 mb-4">
                  {subscriptionPlans.map((plan, idx) => {
                    const isSelected = selectedPlanId === plan.id;
                    const original = tierType === 'BASIC' ? plan.basicOriginalPrice : plan.ultraOriginalPrice;
                    let price = tierType === 'BASIC' ? plan.basicPrice : plan.ultraPrice;
                    if (totalDiscount > 0) price = Math.round(price * (1 - totalDiscount / 100));
                    const perMonth = getPerMonthPrice(plan, price);
                    const isPopular = plan.name.toLowerCase().includes('monthly') || (subscriptionPlans.length > 1 && idx === 1);

                    return (
                      <button key={plan.id} onClick={() => setSelectedPlanId(plan.id)}
                        className="w-full p-4 rounded-2xl text-left transition-all relative overflow-hidden"
                        style={isSelected
                          ? { background: ac.bg, border: `2px solid ${ac.border}`, boxShadow: `0 0 0 1px ${ac.border}, 0 0 20px ${ac.glow}` }
                          : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                        {isSelected && (
                          <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.025) 50%,transparent 60%)', animation: 'shimmer-sweep 2.5s linear infinite' }} />
                        )}
                        {isPopular && !isSelected && (
                          <div className="absolute top-0 right-0 text-black text-[8px] font-black px-2.5 py-1 rounded-bl-xl rounded-tr-xl"
                            style={{ background: '#f59e0b' }}>POPULAR</div>
                        )}
                        {isSelected && (
                          <div className="absolute top-0 right-0 text-white text-[8px] font-black px-2.5 py-1 rounded-bl-xl rounded-tr-xl"
                            style={{ background: ac.grad }}>✓ SELECTED</div>
                        )}
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex-1">
                            <p className="text-sm font-black mb-0.5" style={{ color: isSelected ? ac.text : '#cbd5e1' }}>{plan.name}</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-white">₹{price.toLocaleString('en-IN')}</span>
                              {original > price && <span className="text-slate-700 text-xs line-through">₹{original.toLocaleString('en-IN')}</span>}
                            </div>
                            {perMonth && <p className="text-[10px] text-slate-600 mt-0.5">≈ ₹{perMonth}/month</p>}
                          </div>
                          {totalDiscount > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>
                              {totalDiscount}% OFF
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* CTA button */}
                <button
                  onClick={() => {
                    if (!selectedPlan) return;
                    let finalPrice = tierType === 'BASIC' ? selectedPlan.basicPrice : selectedPlan.ultraPrice;
                    if (totalDiscount > 0) finalPrice = Math.round(finalPrice * (1 - totalDiscount / 100));
                    if (settings?.creditFreeEvent?.enabled) finalPrice = 0;
                    initiatePurchase({ ...selectedPlan, finalPrice });
                  }}
                  className="w-full py-4 rounded-2xl font-black text-sm tracking-wide text-white relative overflow-hidden group mb-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: ac.grad, boxShadow: `0 8px 24px ${ac.glow}` }}>
                  <span className="absolute inset-0 bg-white/15 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Sparkles size={15} />
                    Get {isPro ? 'PRO' : 'MAX'} — Abhi Unlock Karo
                  </span>
                </button>

                {/* Trust badges */}
                <div className="flex justify-center gap-5 mb-4">
                  {[{icon:<ShieldCheck size={12}/>,text:'Secure Payment'},{icon:<Flame size={12}/>,text:'Instant Access'},{icon:<Star size={12}/>,text:'Premium Support'}].map(b=>(
                    <div key={b.text} className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold">{b.icon}<span>{b.text}</span></div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
