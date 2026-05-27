import React, { useState, useEffect } from 'react';
import { User, CreditPackage, SystemSettings } from '../types';
import {
  Sparkles, Check, MessageSquare, Lock, Ticket, ShieldCheck, Star,
  ChevronRight, Flame, BadgeCheck, History, TrendingDown,
  Calendar, Clock, Crown, DollarSign, ArrowLeft, Zap, Gift, Coins
} from 'lucide-react';
import { getLevelInfo, getNextLevelInfo, getLevelProgress, getScoreDiscountFromScore } from '../utils/levelSystem';

interface Props {
  user: User;
  settings?: SystemSettings;
  onUserUpdate: (user: User) => void;
  renderEarnContent?: React.ReactNode;
}

const DEFAULT_PACKAGES: CreditPackage[] = [
  { id: 'pkg-1', name: '100 Credits', credits: 100, price: 10 },
  { id: 'pkg-2', name: '200 Credits', credits: 200, price: 20 },
  { id: 'pkg-3', name: '500 Credits', credits: 500, price: 50 },
  { id: 'pkg-4', name: '1000 Credits', credits: 1000, price: 100 },
  { id: 'pkg-5', name: '2000 Credits', credits: 2000, price: 200 },
  { id: 'pkg-6', name: '5000 Credits', credits: 5000, price: 500 },
  { id: 'pkg-7', name: '10000 Credits', credits: 10000, price: 1000 }
];

/* ─── Subscription History ─── */
const SubHistory: React.FC<{ user: User; onBack: () => void }> = ({ user, onBack }) => {
  const history = user.subscriptionHistory || [];
  const totalPaid = history.reduce((s, i) => s + i.price, 0);
  const totalFree = history.reduce((s, i) => i.isFree ? s + i.originalPrice : s, 0);
  const sorted = [...history].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-28 animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-5 pb-6" style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.18) 0%, transparent 60%)' }} />
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
        {/* Summary */}
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

        {/* List */}
        <div>
          <h3 className="font-black text-slate-400 text-xs flex items-center gap-2 mb-3 uppercase tracking-widest">
            <History size={14} /> Recent Activity
          </h3>
          {sorted.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <Crown size={40} className="mx-auto mb-3 text-slate-700" />
              <p className="font-bold text-slate-500 text-sm">Koi history nahi mili</p>
              <p className="text-xs text-slate-600 mt-1">Pehli plan lo — yahan record aayega</p>
            </div>
          )}
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
        </div>
      </div>
    </div>
  );
};

/* ─── Main Store ─── */
export const Store: React.FC<Props> = ({ user, settings, renderEarnContent }) => {
  const [tierType, setTierType] = useState<'BASIC' | 'ULTRA' | 'EARN' | 'CREDITS'>('BASIC');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const packages = settings?.packages || DEFAULT_PACKAGES;
  const subscriptionPlans = settings?.subscriptionPlans || [];

  const totalScore = user.totalScore || 0;
  const scoreDiscount = getScoreDiscountFromScore(totalScore);
  const scoreTier = getLevelInfo(totalScore);
  const nextTierInfo = getNextLevelInfo(totalScore);
  const scoreTierProgress = getLevelProgress(totalScore);

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
    if (typeof (window as any).recordActivity === 'function')
      (window as any).recordActivity('PURCHASE', `Initiated Purchase: ${purchaseItem.name}`, price, { itemId: purchaseItem.id, subject: isSub ? 'Subscription' : 'Credits' });
    const msg = `Hello Admin, I want to buy:\n\nItem: ${purchaseItem.name} ${isSub ? `(${tierType === 'BASIC' ? 'PRO' : 'MAX'})` : ''}\nPrice: ₹${price}\nUser ID: ${user.id}\nDetails: ${features}\n\nPlease share payment details.`;
    window.open(`https://wa.me/91${numEntry.number}?text=${encodeURIComponent(msg)}`, '_blank');
    setShowSupportModal(false);
  };
  const initiatePurchase = (item: any) => { setPurchaseItem(item); setShowSupportModal(true); };

  if (showHistory) return <SubHistory user={user} onBack={() => setShowHistory(false)} />;

  if (settings?.isPaymentEnabled === false) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 p-10 text-center max-w-sm w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Lock size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Store Locked</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            {settings.paymentDisabledMessage || 'Purchases are currently disabled by the Admin.'}
          </p>
        </div>
      </div>
    );
  }

  const defaultBasicFeatures = ['Daily Login Bonus: 10 Credits/Day','Full MCQs Unlocked','Premium Notes (Standard)','Audio Library (Standard)','AI Videos (2D Basic)','Team Support','Spin Wheel (5 Spins/Day)'];
  const defaultUltraFeatures = ['Daily Login Bonus: 20 Credits/Day','Everything in Basic Unlocked','Premium Notes (Deep Dive)','Ultra Podcast (Studio HD)','AI Videos (2D + 3D Deep Dive)','Competitive Mode Unlocked 🏆','Spin Wheel (10 Spins/Day)'];
  const featuresList = tierType === 'BASIC'
    ? (settings?.storeFeatures?.basic?.filter(f => f.trim()) || defaultBasicFeatures)
    : (settings?.storeFeatures?.ultra?.filter(f => f.trim()) || defaultUltraFeatures);

  const getPerMonthPrice = (plan: any, price: number) => {
    if (plan.duration.toLowerCase().includes('year') || plan.duration.includes('365')) return Math.round(price / 12);
    return null;
  };

  const isPro = tierType === 'BASIC';
  const isGameEnabled = settings?.isGameEnabled !== false;

  /* ── Dark accent palette ── */
  const PA = {
    // PRO (cyan)
    cyanBorder:  'rgba(6,182,212,0.5)',
    cyanBg:      'rgba(6,182,212,0.10)',
    cyanGlow:    'rgba(6,182,212,0.20)',
    cyanText:    '#67e8f9',
    cyanBadge:   'rgba(6,182,212,0.18)',
    cyanGrad:    'linear-gradient(135deg,#0891b2,#06b6d4)',
    cyanPill:    'rgba(6,182,212,0.25)',
    // MAX (violet)
    violetBorder:'rgba(139,92,246,0.5)',
    violetBg:    'rgba(139,92,246,0.10)',
    violetGlow:  'rgba(139,92,246,0.20)',
    violetText:  '#c4b5fd',
    violetBadge: 'rgba(139,92,246,0.18)',
    violetGrad:  'linear-gradient(135deg,#7c3aed,#8b5cf6)',
    violetPill:  'rgba(139,92,246,0.25)',
  };
  const ac = {
    border:  isPro ? PA.cyanBorder  : PA.violetBorder,
    bg:      isPro ? PA.cyanBg      : PA.violetBg,
    glow:    isPro ? PA.cyanGlow    : PA.violetGlow,
    text:    isPro ? PA.cyanText    : PA.violetText,
    badge:   isPro ? PA.cyanBadge   : PA.violetBadge,
    grad:    isPro ? PA.cyanGrad    : PA.violetGrad,
    pill:    isPro ? PA.cyanPill    : PA.violetPill,
    label:   isPro ? 'PRO'          : 'MAX',
    emoji:   isPro ? '⭐'           : '⚡',
  };

  const allTabs = [
    { id: 'BASIC'   as const, label: 'Pro',     icon: '⭐', activeBg: 'rgba(6,182,212,0.18)',   activeBorder: 'rgba(6,182,212,0.6)',   activeText: '#67e8f9' },
    { id: 'ULTRA'   as const, label: 'Max',     icon: '⚡', activeBg: 'rgba(139,92,246,0.18)',  activeBorder: 'rgba(139,92,246,0.6)',  activeText: '#c4b5fd' },
    { id: 'CREDITS' as const, label: 'Credits', icon: '🪙', activeBg: 'rgba(245,158,11,0.18)',  activeBorder: 'rgba(245,158,11,0.6)',  activeText: '#fcd34d' },
    ...(isGameEnabled ? [{ id: 'EARN' as const, label: 'Earn', icon: '🎰', activeBg: 'rgba(16,185,129,0.18)', activeBorder: 'rgba(16,185,129,0.6)', activeText: '#6ee7b7' }] : []),
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-28 font-sans animate-in fade-in duration-300">

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
      <div className="relative overflow-hidden px-4 pt-5 pb-5" style={{ background: 'linear-gradient(160deg,#0f0f1a 0%,#0d0d1a 60%,#0a0a12 100%)' }}>
        {/* ambient glow based on active tab */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: tierType === 'BASIC' ? 'radial-gradient(ellipse at top right, rgba(6,182,212,0.12) 0%, transparent 55%)'
            : tierType === 'ULTRA' ? 'radial-gradient(ellipse at top right, rgba(139,92,246,0.12) 0%, transparent 55%)'
            : tierType === 'CREDITS' ? 'radial-gradient(ellipse at top right, rgba(245,158,11,0.1) 0%, transparent 55%)'
            : 'radial-gradient(ellipse at top right, rgba(16,185,129,0.1) 0%, transparent 55%)'
        }} />

        {/* Store / Sub History tabs */}
        <div className="relative z-10 flex gap-2 mb-4 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button onClick={() => setShowHistory(false)}
            className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
            style={!showHistory ? { background: 'rgba(255,255,255,0.12)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } : { color: 'rgba(255,255,255,0.45)' }}>
            🛒 Store
          </button>
          <button onClick={() => setShowHistory(true)}
            className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
            style={showHistory ? { background: 'rgba(255,255,255,0.12)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } : { color: 'rgba(255,255,255,0.45)' }}>
            📋 Sub History
          </button>
        </div>

        {/* Title + user info */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{settings?.appName || 'IIC'}</p>
            <h1 className="text-2xl font-black text-white leading-none tracking-tight">Premium Store</h1>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">Apna plan upgrade karo — sab kuch unlock karo</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <span className="text-sm">🪙</span>
              <span className="font-black text-sm" style={{ color: '#fcd34d' }}>{((user.credits ?? 0) + (user.bonusCredits ?? 0)).toLocaleString('en-IN')}</span>
              <span className="text-[9px] font-bold" style={{ color: 'rgba(252,211,77,0.6)' }}>CR</span>
              {(user.bonusCredits ?? 0) > 0 && <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/20 px-1 rounded-full">+{user.bonusCredits}🎁</span>}
            </div>
            {user.isPremium && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: user.subscriptionLevel === 'ULTRA' ? 'rgba(139,92,246,0.2)' : 'rgba(6,182,212,0.2)', color: user.subscriptionLevel === 'ULTRA' ? '#c4b5fd' : '#67e8f9', border: `1px solid ${user.subscriptionLevel === 'ULTRA' ? 'rgba(139,92,246,0.4)' : 'rgba(6,182,212,0.4)'}` }}>
                  {user.subscriptionLevel === 'ULTRA' ? '⚡ ULTRA' : '★ BASIC'} Active
                </span>
                {user.subscriptionEndDate && (() => {
                  const end = new Date(user.subscriptionEndDate);
                  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
                  const dateStr = end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
                  return days > 0 ? <span className="text-[9px] text-slate-600 font-bold">{days}d left · {dateStr}</span> : null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div className="px-4 pt-4">

        {/* ── PLAN TYPE TABS ── */}
        <div className="mb-4">
          <div className={`grid gap-2 ${allTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {allTabs.map(tab => {
              const isActive = tierType === tab.id;
              return (
                <button key={tab.id} onClick={() => setTierType(tab.id)}
                  className="py-3 px-1 rounded-2xl text-[11px] font-black transition-all flex flex-col items-center gap-1 relative overflow-hidden"
                  style={isActive
                    ? { background: tab.activeBg, border: `1.5px solid ${tab.activeBorder}`, color: tab.activeText, boxShadow: `0 0 12px ${tab.activeBg}` }
                    : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                  {isActive && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.04) 50%,transparent 60%)', animation: 'shimmer-sweep 2.5s linear infinite' }} />}
                  <span className="text-lg leading-none relative z-10">{tab.icon}</span>
                  <span className="leading-tight relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EVENT BANNER ── */}
        {showEventBanner && (
          <div className="mb-4 p-4 rounded-2xl border animate-in fade-in"
            style={activeEvent
              ? { background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(234,88,12,0.08))', borderColor: 'rgba(245,158,11,0.4)' }
              : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeEvent ? '🔥' : '⏳'}</span>
              <div className="flex-1">
                <p className="text-sm font-black" style={{ color: activeEvent ? '#fcd34d' : '#cbd5e1' }}>
                  {activeEvent ? `${event?.eventName || 'Flash Sale'} — ${event?.discountPercent || 0}% OFF!` : `${event?.eventName || 'Sale'} — Jald aane wala hai!`}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: activeEvent ? '#fb923c' : '#475569' }}>
                  {activeEvent ? 'Sabhi plans aur credits pe discount apply ho gaya!' : 'Event abhi start nahi hua'}
                </p>
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

        {/* ── EARN ── */}
        {tierType === 'EARN' && isGameEnabled && (
          <div className="animate-in fade-in duration-200">
            {renderEarnContent ?? (
              <div className="text-center py-12 text-slate-500 font-bold">
                <p className="text-2xl mb-2">🎰</p><p>Earn content loading...</p>
              </div>
            )}
          </div>
        )}

        {/* ── CREDITS ── */}
        {tierType === 'CREDITS' && (
          <div className="animate-in fade-in duration-200 space-y-2.5">
            {packages.map((pkg) => {
              let finalPrice = pkg.price;
              let disc = 0;
              if (activeEvent && event?.discountPercent) disc += event.discountPercent;
              if (isSubscribed) disc += 5;
              if (activeStoreDiscount > 0) disc += activeStoreDiscount;
              if (scoreDiscount > 0) disc += scoreDiscount;
              if (visitDiscount > 0) disc += visitDiscount;
              if (disc > 0) { if (disc > 100) disc = 100; finalPrice = Math.round(finalPrice * (1 - disc / 100)); }
              const perCredit = finalPrice > 0 ? (finalPrice / pkg.credits).toFixed(2) : '0';
              const isPopular = pkg.credits === 500;
              return (
                <button key={pkg.id} onClick={() => initiatePurchase(pkg)}
                  className="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
                  style={isPopular
                    ? { background: 'linear-gradient(135deg,rgba(245,158,11,0.14),rgba(234,88,12,0.08))', border: '1.5px solid rgba(245,158,11,0.45)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {isPopular && <div className="absolute top-0 right-0 text-black text-[8px] font-black px-2.5 py-1 rounded-bl-xl rounded-tr-xl" style={{ background: '#f59e0b' }}>POPULAR</div>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>🪙</div>
                      <div>
                        <p className="text-sm font-black text-white">{pkg.credits.toLocaleString('en-IN')} Credits</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">₹{perCredit}/credit · {pkg.name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5">
                        {disc > 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>{disc}% OFF</span>}
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
        {tierType !== 'EARN' && tierType !== 'CREDITS' && (<>

          {/* Score level banner */}
          <div className="mb-3 rounded-2xl overflow-hidden" style={{ border: `1px solid ${ac.border}` }}>
            <div className="h-0.5 w-full" style={{ background: ac.grad }} />
            <div className="p-3.5 flex items-center gap-3" style={{ background: ac.bg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: `${scoreTier.color}22`, boxShadow: `0 0 12px ${scoreTier.glowColor}` }}>
                {scoreTier.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-black text-white">Level {scoreTier.level} {scoreTier.label}</span>
                  <span className="text-[9px] text-slate-500">{totalScore} pts</span>
                  {scoreDiscount > 0 && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: `linear-gradient(90deg,${scoreTier.color}cc,${scoreTier.color})` }}>
                      {scoreDiscount}% OFF
                    </span>
                  )}
                </div>
                {nextTierInfo
                  ? <p className="text-[10px] text-slate-500">{nextTierInfo.minScore - totalScore} aur → Level {nextTierInfo.level} {nextTierInfo.emoji} ({nextTierInfo.discount}% OFF)</p>
                  : <p className="text-[10px] font-bold" style={{ color: '#fcd34d' }}>Max Level — 20% discount unlocked! 🏆</p>}
                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${scoreTierProgress}%`, background: ac.grad }} />
                </div>
              </div>
            </div>
          </div>

          {/* Personal discount */}
          {activeStoreDiscount > 0 && (
            <div className="mb-3 p-3.5 rounded-2xl flex items-center gap-3 animate-in fade-in"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(244,63,94,0.2)' }}>
                <Ticket size={16} className="text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-black text-rose-400">Personal Discount Active! 🎉</p>
                <p className="text-[11px] text-rose-600">{activeStoreDiscount}% OFF sabhi plans pe — Level 4 tak valid</p>
              </div>
            </div>
          )}

          {/* Visit discount */}
          {visitDiscountEnabled && isEligibleForVisitDiscount && (
            <div className="mb-3 rounded-2xl overflow-hidden animate-in fade-in"
              style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
              <div className="p-3.5 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.08)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'rgba(16,185,129,0.2)' }}>🏬</div>
                <div className="flex-1 min-w-0">
                  {visitDiscount > 0 ? (
                    <>
                      <p className="text-sm font-black text-emerald-400">Visit Discount Active! +{visitDiscount}% OFF 🎉</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">{visitCount} store visits{nextVisitRule && ` · ${nextVisitRule.visits - visitCount} aur pe ${nextVisitRule.discountPercent}% OFF`}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-black text-emerald-500">{visitCount} visit{visitCount !== 1 ? 's' : ''} 🏬</p>
                      {nextVisitRule && <p className="text-[10px] text-emerald-600 mt-0.5">Sirf {nextVisitRule.visits - visitCount} aur visits par {nextVisitRule.discountPercent}% OFF!</p>}
                    </>
                  )}
                </div>
                {visitDiscount > 0 && <span className="shrink-0 text-[11px] font-black px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)' }}>-{visitDiscount}%</span>}
              </div>
              {nextVisitRule && (
                <div className="px-3.5 py-2 flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.04)', borderTop: '1px solid rgba(16,185,129,0.12)' }}>
                  <span className="text-[9px] text-slate-600 font-bold shrink-0">{visitCount}v</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100,(visitCount/nextVisitRule.visits)*100)}%`, background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
                  </div>
                  <span className="text-[9px] text-emerald-500 font-black shrink-0">{nextVisitRule.visits}v → {nextVisitRule.discountPercent}% OFF</span>
                </div>
              )}
            </div>
          )}

          {/* ── PLAN HERO CARD ── */}
          <div className="mb-4 rounded-2xl p-4 relative overflow-hidden" style={{ background: ac.bg, border: `1.5px solid ${ac.border}` }}>
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none" style={{ background: ac.glow, filter: 'blur(24px)' }} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: ac.pill, color: ac.text, border: `1px solid ${ac.border}` }}>
                      {ac.emoji} {ac.label}
                    </span>
                    {isSubscribed && (
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeCheck size={9} /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black leading-none" style={{ color: ac.text }}>{isPro ? 'Pro Plan' : 'Max Plan'}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{isPro ? 'Sabse zyada popular choice' : 'Ultimate learning experience'}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: ac.pill, border: `1px solid ${ac.border}` }}>
                  {ac.emoji}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {featuresList.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: ac.pill }}>
                      <Check size={9} style={{ color: ac.text }} strokeWidth={3} />
                    </div>
                    <span className="text-[12px] text-slate-400 font-medium leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PRICING PLANS ── */}
          <div className="space-y-2.5 mb-4">
            {subscriptionPlans.map((plan, idx) => {
              const isSelected = selectedPlanId === plan.id;
              const original = tierType === 'BASIC' ? plan.basicOriginalPrice : plan.ultraOriginalPrice;
              let price = tierType === 'BASIC' ? plan.basicPrice : plan.ultraPrice;
              let disc = 0;
              if (activeEvent && event?.discountPercent) disc += event.discountPercent;
              if (isSubscribed) disc += 5;
              if (activeStoreDiscount > 0) disc += activeStoreDiscount;
              if (scoreDiscount > 0) disc += scoreDiscount;
              if (visitDiscount > 0) disc += visitDiscount;
              if (disc > 0) { if (disc > 100) disc = 100; price = Math.round(price * (1 - disc / 100)); }
              const perMonth = getPerMonthPrice(plan, price);
              const isPopular = plan.name.toLowerCase().includes('monthly') || (subscriptionPlans.length > 1 && idx === 1);

              return (
                <button key={plan.id} onClick={() => setSelectedPlanId(plan.id)}
                  className="w-full p-4 rounded-2xl text-left transition-all relative overflow-hidden"
                  style={isSelected
                    ? { background: ac.bg, border: `2px solid ${ac.border}`, boxShadow: `0 0 0 1px ${ac.border}, 0 0 20px ${ac.glow}` }
                    : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                  {isSelected && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.025) 50%,transparent 60%)', animation: 'shimmer-sweep 2.5s linear infinite' }} />}
                  {isPopular && !isSelected && (
                    <div className="absolute top-0 right-0 text-black text-[8px] font-black px-2.5 py-1 rounded-bl-xl rounded-tr-xl" style={{ background: '#f59e0b' }}>POPULAR</div>
                  )}
                  {isSelected && (
                    <div className="absolute top-0 right-0 text-white text-[8px] font-black px-2.5 py-1 rounded-bl-xl rounded-tr-xl" style={{ background: ac.grad }}>✓ SELECTED</div>
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
                    <div className="flex flex-col items-end gap-1">
                      {disc > 0 && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>{disc}% OFF</span>}
                      {isSubscribed && disc >= 5 && <span className="text-[8px] font-bold" style={{ color: ac.text }}>+5% Renewal</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── CTA BUTTON ── */}
          {subscriptionPlans.length > 0 && (
            <button
              onClick={() => {
                if (!selectedPlan) return;
                let finalPrice = tierType === 'BASIC' ? selectedPlan.basicPrice : selectedPlan.ultraPrice;
                let disc = 0;
                if (activeEvent && event?.discountPercent) disc += event.discountPercent;
                if (isSubscribed) disc += 5;
                if (activeStoreDiscount > 0) disc += activeStoreDiscount;
                if (scoreDiscount > 0) disc += scoreDiscount;
                if (visitDiscount > 0) disc += visitDiscount;
                if (disc > 0) { if (disc > 100) disc = 100; finalPrice = Math.round(finalPrice * (1 - disc / 100)); }
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
          )}

          {/* Trust badges */}
          <div className="flex justify-center gap-5 mb-4">
            {[{icon:<ShieldCheck size={12}/>,text:'Secure Payment'},{icon:<Flame size={12}/>,text:'Instant Access'},{icon:<Star size={12}/>,text:'Premium Support'}].map(b=>(
              <div key={b.text} className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold">{b.icon}<span>{b.text}</span></div>
            ))}
          </div>

        </>)}
      </div>
    </div>
  );
};
