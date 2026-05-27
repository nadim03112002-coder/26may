import React, { useState } from 'react';
import { User, UserCustomTheme, SystemSettings } from '../types';
import { saveUserToLive, saveSystemSettings } from '../firebase';
import { getTotalCredits, applyDeduction } from '../utils/creditSystem';
import {
    ArrowLeft, Sparkles, RotateCcw, Eye, Palette,
    Layers, Navigation, Square, Type, Zap, Star,
    ChevronRight, Check, X, AlertCircle, Globe, Clock, Users, BarChart2
} from 'lucide-react';

interface Props {
    user: User;
    onUpdateUser: (u: User) => void;
    onBack: () => void;
    settings?: SystemSettings | null;
    onUpdateSettings?: (s: SystemSettings) => void;
}

const THEME_COST = 200;

interface ThemeState {
    bgColor: string;
    topBarStart: string;
    topBarEnd: string;
    navBg: string;
    navActive: string;
    navBorder: string;
    cardBg: string;
    cardBorder: string;
    btnStart: string;
    btnEnd: string;
    textPrimary: string;
    textSecondary: string;
    accentGlow: string;
    progressColor: string;
}

const DEFAULT_THEME: ThemeState = {
    bgColor: '#080a10',
    topBarStart: '#1e3a5f',
    topBarEnd: '#0f1e3c',
    navBg: '#0d0f18',
    navActive: '#3b82f6',
    navBorder: '#1e2a3f',
    cardBg: '#111827',
    cardBorder: '#1e293b',
    btnStart: '#3b82f6',
    btnEnd: '#6366f1',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    accentGlow: '#3b82f6',
    progressColor: '#3b82f6',
};

const PRESETS: Array<{ name: string; emoji: string; colors: ThemeState }> = [
    {
        name: 'Ocean Blue', emoji: '🌊',
        colors: {
            bgColor: '#050d1a', topBarStart: '#0c2d6b', topBarEnd: '#061635',
            navBg: '#080f1f', navActive: '#38bdf8', navBorder: '#0f2040',
            cardBg: '#0d1a33', cardBorder: '#1a3050',
            btnStart: '#0ea5e9', btnEnd: '#6366f1',
            textPrimary: '#e0f2fe', textSecondary: '#7dd3fc',
            accentGlow: '#38bdf8', progressColor: '#0ea5e9',
        }
    },
    {
        name: 'Sakura', emoji: '🌸',
        colors: {
            bgColor: '#120008', topBarStart: '#7b1045', topBarEnd: '#3d0820',
            navBg: '#18040e', navActive: '#f43f5e', navBorder: '#3d1020',
            cardBg: '#200a12', cardBorder: '#3d1525',
            btnStart: '#f43f5e', btnEnd: '#ec4899',
            textPrimary: '#ffe4e6', textSecondary: '#fda4af',
            accentGlow: '#f43f5e', progressColor: '#e11d48',
        }
    },
    {
        name: 'Forest', emoji: '🌿',
        colors: {
            bgColor: '#030d06', topBarStart: '#064e20', topBarEnd: '#022b10',
            navBg: '#040e07', navActive: '#22c55e', navBorder: '#083a16',
            cardBg: '#07150b', cardBorder: '#0d2e14',
            btnStart: '#16a34a', btnEnd: '#059669',
            textPrimary: '#dcfce7', textSecondary: '#86efac',
            accentGlow: '#22c55e', progressColor: '#16a34a',
        }
    },
    {
        name: 'Gold', emoji: '⚡',
        colors: {
            bgColor: '#0d0800', topBarStart: '#7c4a00', topBarEnd: '#3d2200',
            navBg: '#110900', navActive: '#f59e0b', navBorder: '#3d2500',
            cardBg: '#180f00', cardBorder: '#3d2200',
            btnStart: '#f59e0b', btnEnd: '#f97316',
            textPrimary: '#fef9c3', textSecondary: '#fde68a',
            accentGlow: '#f59e0b', progressColor: '#d97706',
        }
    },
    {
        name: 'Violet', emoji: '💜',
        colors: {
            bgColor: '#06020e', topBarStart: '#4a1d96', topBarEnd: '#2e1065',
            navBg: '#080316', navActive: '#a855f7', navBorder: '#2e1065',
            cardBg: '#0f0520', cardBorder: '#2d1060',
            btnStart: '#8b5cf6', btnEnd: '#ec4899',
            textPrimary: '#f3e8ff', textSecondary: '#d8b4fe',
            accentGlow: '#a855f7', progressColor: '#7c3aed',
        }
    },
    {
        name: 'Sunset', emoji: '🔥',
        colors: {
            bgColor: '#0d0400', topBarStart: '#9a2a00', topBarEnd: '#4d1500',
            navBg: '#100500', navActive: '#f97316', navBorder: '#4d1800',
            cardBg: '#180600', cardBorder: '#3d1200',
            btnStart: '#f97316', btnEnd: '#ef4444',
            textPrimary: '#ffedd5', textSecondary: '#fed7aa',
            accentGlow: '#f97316', progressColor: '#ea580c',
        }
    },
    {
        name: 'Arctic', emoji: '❄️',
        colors: {
            bgColor: '#020d14', topBarStart: '#0e4060', topBarEnd: '#061a2b',
            navBg: '#040e18', navActive: '#67e8f9', navBorder: '#0e3050',
            cardBg: '#071520', cardBorder: '#0e2535',
            btnStart: '#22d3ee', btnEnd: '#06b6d4',
            textPrimary: '#ecfeff', textSecondary: '#a5f3fc',
            accentGlow: '#22d3ee', progressColor: '#0891b2',
        }
    },
    {
        name: 'Ruby', emoji: '❤️',
        colors: {
            bgColor: '#0d0000', topBarStart: '#7f1d1d', topBarEnd: '#450a0a',
            navBg: '#100000', navActive: '#ef4444', navBorder: '#450a0a',
            cardBg: '#1a0505', cardBorder: '#3d1010',
            btnStart: '#ef4444', btnEnd: '#dc2626',
            textPrimary: '#fee2e2', textSecondary: '#fca5a5',
            accentGlow: '#ef4444', progressColor: '#dc2626',
        }
    },
    {
        name: 'Midnight', emoji: '🌌',
        colors: {
            bgColor: '#02020a', topBarStart: '#1a1a3a', topBarEnd: '#0d0d1f',
            navBg: '#030308', navActive: '#818cf8', navBorder: '#1a1a35',
            cardBg: '#08081a', cardBorder: '#1a1a30',
            btnStart: '#6366f1', btnEnd: '#4f46e5',
            textPrimary: '#e0e7ff', textSecondary: '#a5b4fc',
            accentGlow: '#818cf8', progressColor: '#4f46e5',
        }
    },
    {
        name: 'Emerald', emoji: '💎',
        colors: {
            bgColor: '#020d0a', topBarStart: '#065f46', topBarEnd: '#022c20',
            navBg: '#030e0a', navActive: '#10b981', navBorder: '#064e38',
            cardBg: '#061510', cardBorder: '#0a2e20',
            btnStart: '#10b981', btnEnd: '#059669',
            textPrimary: '#d1fae5', textSecondary: '#6ee7b7',
            accentGlow: '#10b981', progressColor: '#059669',
        }
    },
    {
        name: 'Royal', emoji: '👑',
        colors: {
            bgColor: '#020610', topBarStart: '#1e3a8a', topBarEnd: '#0f1e5c',
            navBg: '#030818', navActive: '#60a5fa', navBorder: '#1e2d6b',
            cardBg: '#060e25', cardBorder: '#1a2555',
            btnStart: '#2563eb', btnEnd: '#1d4ed8',
            textPrimary: '#dbeafe', textSecondary: '#93c5fd',
            accentGlow: '#3b82f6', progressColor: '#1d4ed8',
        }
    },
    {
        name: 'Rose Gold', emoji: '🌹',
        colors: {
            bgColor: '#0d0608', topBarStart: '#881337', topBarEnd: '#4c0519',
            navBg: '#100508', navActive: '#fb7185', navBorder: '#4c0a1e',
            cardBg: '#1a0610', cardBorder: '#3d1020',
            btnStart: '#fb7185', btnEnd: '#f43f5e',
            textPrimary: '#ffe4e6', textSecondary: '#fda4af',
            accentGlow: '#fb7185', progressColor: '#e11d48',
        }
    },
];

type ColorSection = 'BACKGROUND' | 'TOPBAR' | 'NAVIGATION' | 'CARDS' | 'BUTTONS' | 'TEXT' | 'ACCENTS';

const SECTIONS: Array<{ id: ColorSection; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'BACKGROUND', label: 'Background', icon: <Layers size={13} />,      desc: 'App ki main background color' },
    { id: 'TOPBAR',     label: 'Top Bar',    icon: <ChevronRight size={13} />, desc: 'Header gradient — dono colors alag' },
    { id: 'NAVIGATION', label: 'Navigation', icon: <Navigation size={13} />,   desc: 'Bottom nav — 3 colors alag' },
    { id: 'CARDS',      label: 'Cards',      icon: <Square size={13} />,       desc: 'Card background aur border alag' },
    { id: 'BUTTONS',    label: 'Buttons',    icon: <Zap size={13} />,          desc: 'Button gradient — dono alag' },
    { id: 'TEXT',       label: 'Text',       icon: <Type size={13} />,         desc: 'Primary aur secondary text alag' },
    { id: 'ACCENTS',    label: 'Accents',    icon: <Star size={13} />,         desc: 'Glow aur progress bar alag' },
];

interface ColorRowProps {
    label: string;
    sub?: string;
    value: string;
    onChange: (v: string) => void;
    accent: string;
}
const ColorRow: React.FC<ColorRowProps> = ({ label, sub, value, onChange, accent }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
        <div
            className="w-10 h-10 rounded-xl border-2 shrink-0 cursor-pointer relative overflow-hidden shadow-lg"
            style={{ background: value, borderColor: `${accent}40` }}
        >
            <input
                type="color" value={value}
                onChange={e => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white/90">{label}</p>
            {sub && <p className="text-[9px] text-white/35 mt-0.5">{sub}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-mono text-white/20">{value.toUpperCase()}</span>
            <div
                className="w-6 h-6 rounded-lg border border-white/10 cursor-pointer relative overflow-hidden"
                style={{ background: value }}
            >
                <input
                    type="color" value={value}
                    onChange={e => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    </div>
);

const stateFromTheme = (t: UserCustomTheme | undefined): ThemeState => {
    if (!t) return { ...DEFAULT_THEME };
    return {
        bgColor:       t.bgColor       || DEFAULT_THEME.bgColor,
        topBarStart:   t.topBarStart   || DEFAULT_THEME.topBarStart,
        topBarEnd:     t.topBarEnd     || DEFAULT_THEME.topBarEnd,
        navBg:         t.navBg         || DEFAULT_THEME.navBg,
        navActive:     t.navActive     || t.accentColor || DEFAULT_THEME.navActive,
        navBorder:     t.navBorder     || DEFAULT_THEME.navBorder,
        cardBg:        t.cardBg        || t.cardColor   || DEFAULT_THEME.cardBg,
        cardBorder:    t.cardBorder    || DEFAULT_THEME.cardBorder,
        btnStart:      t.btnStart      || t.accentColor || DEFAULT_THEME.btnStart,
        btnEnd:        t.btnEnd        || DEFAULT_THEME.btnEnd,
        textPrimary:   t.textColor     || DEFAULT_THEME.textPrimary,
        textSecondary: t.textSecondary || DEFAULT_THEME.textSecondary,
        accentGlow:    t.accentGlow    || t.accentColor || DEFAULT_THEME.accentGlow,
        progressColor: t.progressColor || t.accentColor || DEFAULT_THEME.progressColor,
    };
};

export const ThemeCustomizer: React.FC<Props> = ({ user, onUpdateUser, onBack, settings, onUpdateSettings }) => {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUB_ADMIN';

    /* ── NON-ADMIN GUARD: users cannot change themes, only view ── */
    if (!isAdmin) {
        const _pt = user.personalTheme;
        const _accentColor = _pt?.btnStart || _pt?.accentColor || '#10b981';
        return (
            <div className="fixed inset-0 z-50 flex flex-col" style={{ background: _pt?.bgColor || '#050f0a' }}>
                <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: `${_accentColor}18`, borderBottom: `1px solid ${_accentColor}30` }}>
                    <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${_accentColor}20` }}>
                        <span className="text-white text-lg">←</span>
                    </button>
                    <p className="text-white font-bold text-sm flex-1">Aapka Theme</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: `${_accentColor}25`, border: `2px solid ${_accentColor}50` }}>🎨</div>
                    {_pt ? (
                        <>
                            <div className="text-center">
                                <p className="text-white font-bold text-lg mb-1">Custom Theme Active ✨</p>
                                <p className="text-white/50 text-sm">Admin ne aapke liye yeh theme set ki hai</p>
                            </div>
                            <div className="w-full rounded-2xl p-4 flex flex-col gap-3" style={{ background: `${_accentColor}15`, border: `1px solid ${_accentColor}30` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ background: _accentColor }} />
                                    <div>
                                        <p className="text-white text-xs font-bold">Accent Color</p>
                                        <p className="text-white/40 text-[10px]">{_accentColor}</p>
                                    </div>
                                </div>
                                {_pt.topBarStart && _pt.topBarEnd && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ background: `linear-gradient(135deg,${_pt.topBarStart},${_pt.topBarEnd})` }} />
                                        <div>
                                            <p className="text-white text-xs font-bold">Top Bar</p>
                                            <p className="text-white/40 text-[10px]">{_pt.topBarStart} → {_pt.topBarEnd}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-white font-bold text-lg mb-1">Default Theme</p>
                            <p className="text-white/50 text-sm">Abhi koi custom theme active nahi hai</p>
                        </div>
                    )}
                    <div className="w-full rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-white/60 text-xs">🔒 Theme sirf Admin badal sakta hai</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalCoins = getTotalCredits(user);
    const isFirstTime = !user.personalTheme;

    /* ── STATE ── */
    const [theme, setTheme]               = useState<ThemeState>(() => stateFromTheme(user.personalTheme));
    const [saving, setSaving]             = useState(false);
    const [activeSection, setActiveSection] = useState<ColorSection>('TOPBAR');

    /* Entry popup — shown once when user opens Theme Studio */
    const [showEntryPopup, setShowEntryPopup] = useState(true);

    /* Coin confirmation popup — shown before applying a 2nd/changed theme */
    const [showCoinPopup, setShowCoinPopup]   = useState(false);

    /* ── ADMIN GLOBAL APPLY STATE ── */
    const [showGlobalPopup, setShowGlobalPopup] = useState(false);
    const [globalDuration, setGlobalDuration]   = useState<'permanent' | '24h' | '7d' | '30d'>('permanent');
    const [globalTier, setGlobalTier]           = useState<'all' | 'ultra' | 'basic' | 'free'>('all');
    const [globalMinLevel, setGlobalMinLevel]   = useState<number>(0);
    const [globalMaxLevel, setGlobalMaxLevel]   = useState<number>(0);
    /* Local live state so admin sees immediate feedback after apply/remove */
    const [liveAdminTheme, setLiveAdminTheme]   = useState(settings?.adminAppliedTheme);

    const setColor = (key: keyof ThemeState) => (v: string) =>
        setTheme(prev => ({ ...prev, [key]: v }));

    /* ─────────────────────────────────────────
       APPLY THEME
    ───────────────────────────────────────── */
    const doApply = async () => {
        setSaving(true);
        setShowCoinPopup(false);

        const themeObj: UserCustomTheme = {
            id: `ptheme_${user.id}_${Date.now()}`,
            userId: user.id,
            userName: user.name,
            bgColor:       theme.bgColor,
            accentColor:   theme.btnStart,
            textColor:     theme.textPrimary,
            cardColor:     theme.cardBg,
            topBarStart:   theme.topBarStart,
            topBarEnd:     theme.topBarEnd,
            navBg:         theme.navBg,
            navActive:     theme.navActive,
            navBorder:     theme.navBorder,
            cardBg:        theme.cardBg,
            cardBorder:    theme.cardBorder,
            btnStart:      theme.btnStart,
            btnEnd:        theme.btnEnd,
            textSecondary: theme.textSecondary,
            accentGlow:    theme.accentGlow,
            progressColor: theme.progressColor,
            createdAt:     new Date().toISOString(),
            likes:         0,
        };

        let baseUser: User;
        if (isAdmin || isFirstTime) {
            /* Admin = free always. First time user = free. */
            baseUser = { ...user };
        } else {
            /* Paid apply — deduct 200 coins */
            const deducted = applyDeduction(user, THEME_COST);
            if (!deducted) {
                /* Should not reach here (we checked before showing popup), but safety net */
                alert(`⚠️ Coins insufficient. Theme apply nahi hua.`);
                setSaving(false);
                return;
            }
            baseUser = { ...deducted };
        }

        const updated: User = {
            ...baseUser,
            personalTheme:      themeObj,
            personalThemeColor: theme.btnStart,
        };

        onUpdateUser(updated);
        try { await saveUserToLive(updated); } catch {}
        setSaving(false);

        const msg = isAdmin
            ? '✅ Theme apply ho gayi! (Admin — free)'
            : isFirstTime
                ? '✅ Pehli baar FREE mein theme apply ho gayi! 🎉\nAgle baar theme change karne pe 200 coins lagenge.'
                : `✅ Theme apply ho gayi! 200 🪙 coins kat gaye.`;
        alert(msg);
    };

    const handleApplyClick = () => {
        if (isAdmin || isFirstTime) {
            doApply();
            return;
        }
        if (totalCoins < THEME_COST) {
            alert(`❌ Coins kam hain!\nTheme change karne ke liye ${THEME_COST} coins chahiye.\nAapke paas sirf ${totalCoins} coins hain.`);
            return;
        }
        setShowCoinPopup(true);
    };

    /* ─────────────────────────────────────────
       ADMIN GLOBAL BROADCAST APPLY
    ───────────────────────────────────────── */
    const buildThemeObj = (): UserCustomTheme => ({
        id: `ptheme_${user.id}_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        bgColor:       theme.bgColor,
        accentColor:   theme.btnStart,
        textColor:     theme.textPrimary,
        cardColor:     theme.cardBg,
        topBarStart:   theme.topBarStart,
        topBarEnd:     theme.topBarEnd,
        navBg:         theme.navBg,
        navActive:     theme.navActive,
        navBorder:     theme.navBorder,
        cardBg:        theme.cardBg,
        cardBorder:    theme.cardBorder,
        btnStart:      theme.btnStart,
        btnEnd:        theme.btnEnd,
        textSecondary: theme.textSecondary,
        accentGlow:    theme.accentGlow,
        progressColor: theme.progressColor,
        createdAt:     new Date().toISOString(),
        likes:         0,
    });

    const doGlobalApply = async () => {
        setShowGlobalPopup(false);
        setSaving(true);
        const themeObj = buildThemeObj();
        let expiresAt: string | null = null;
        if (globalDuration === '24h')  expiresAt = new Date(Date.now() + 86400000).toISOString();
        if (globalDuration === '7d')   expiresAt = new Date(Date.now() + 7  * 86400000).toISOString();
        if (globalDuration === '30d')  expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
        const adminAppliedTheme = {
            theme: themeObj,
            appliedAt: new Date().toISOString(),
            expiresAt: expiresAt ?? null,
            targetTier: globalTier,
            minLevel: globalMinLevel > 0 ? globalMinLevel : null,
            maxLevel: globalMaxLevel > 0 ? globalMaxLevel : null,
        };
        const newSettings = { ...(settings || {}), adminAppliedTheme };
        try {
            await saveSystemSettings(newSettings);
            onUpdateSettings?.(newSettings as any);
            setLiveAdminTheme(adminAppliedTheme as any);
            alert(`✅ Theme broadcast ho gayi!\n${globalTier === 'all' ? 'Sabhi users' : globalTier.toUpperCase() + ' users'} ko yeh theme milegi.`);
        } catch {
            alert('❌ Kuch galat hua — dobara try karo.');
        }
        setSaving(false);
    };

    const doRemoveGlobal = async () => {
        if (!confirm('App se global theme hatana chahte ho? Sab users default pe wapas jaayenge.')) return;
        setSaving(true);
        const newSettings = { ...(settings || {}) };
        delete (newSettings as any).adminAppliedTheme;
        try {
            await saveSystemSettings(newSettings);
            onUpdateSettings?.(newSettings as any);
            setLiveAdminTheme(undefined);
            alert('✅ Global theme hata di gayi.');
        } catch {
            alert('❌ Error — dobara try karo.');
        }
        setSaving(false);
    };

    const handleReset = async () => {
        if (!confirm('Apni custom theme hatana chahte ho aur default pe wapas jaana chahte ho?')) return;
        setSaving(true);
        const updated: User = { ...user };
        delete (updated as any).personalTheme;
        delete (updated as any).personalThemeColor;
        onUpdateUser(updated);
        try { await saveUserToLive(updated); } catch {}
        setSaving(false);
        setTheme({ ...DEFAULT_THEME });
    };

    const sectionColors: Record<ColorSection, React.ReactNode> = {
        BACKGROUND: (
            <ColorRow label="App Background" sub="Puri app ki main background" value={theme.bgColor} onChange={setColor('bgColor')} accent={theme.btnStart} />
        ),
        TOPBAR: (
            <>
                <ColorRow label="Gradient — Left Color"  sub="Top bar ka baayi taraf"  value={theme.topBarStart} onChange={setColor('topBarStart')} accent={theme.btnStart} />
                <ColorRow label="Gradient — Right Color" sub="Top bar ka seedha taraf" value={theme.topBarEnd}   onChange={setColor('topBarEnd')}   accent={theme.btnStart} />
            </>
        ),
        NAVIGATION: (
            <>
                <ColorRow label="Nav Background" sub="Bottom bar ka background"         value={theme.navBg}     onChange={setColor('navBg')}     accent={theme.btnStart} />
                <ColorRow label="Active Tab Color" sub="Selected tab color + underline" value={theme.navActive} onChange={setColor('navActive')} accent={theme.btnStart} />
                <ColorRow label="Nav Border"       sub="Top border line ka color"       value={theme.navBorder} onChange={setColor('navBorder')} accent={theme.btnStart} />
            </>
        ),
        CARDS: (
            <>
                <ColorRow label="Card Background" sub="Chapters, MCQ aur saare cards" value={theme.cardBg}     onChange={setColor('cardBg')}     accent={theme.btnStart} />
                <ColorRow label="Card Border"     sub="Cards ke around border color"  value={theme.cardBorder} onChange={setColor('cardBorder')} accent={theme.btnStart} />
            </>
        ),
        BUTTONS: (
            <>
                <ColorRow label="Button Gradient — Start" sub="Pehla color" value={theme.btnStart} onChange={setColor('btnStart')} accent={theme.btnStart} />
                <ColorRow label="Button Gradient — End"   sub="Doosra color" value={theme.btnEnd}   onChange={setColor('btnEnd')}   accent={theme.btnStart} />
            </>
        ),
        TEXT: (
            <>
                <ColorRow label="Primary Text"   sub="Main headings aur important text" value={theme.textPrimary}   onChange={setColor('textPrimary')}   accent={theme.btnStart} />
                <ColorRow label="Secondary Text" sub="Descriptions aur sub-text"        value={theme.textSecondary} onChange={setColor('textSecondary')} accent={theme.btnStart} />
            </>
        ),
        ACCENTS: (
            <>
                <ColorRow label="Glow / Accent" sub="Avatar glow, level ring, highlights" value={theme.accentGlow}    onChange={setColor('accentGlow')}    accent={theme.btnStart} />
                <ColorRow label="Progress Bar"  sub="Score bars, loading bars ka color"   value={theme.progressColor} onChange={setColor('progressColor')} accent={theme.btnStart} />
            </>
        ),
    };

    return (
        <>
        <div className="min-h-screen pb-32 select-none" style={{ background: '#06080f' }}>

            {/* ══════════════════════════════════════════
                ENTRY POPUP — shown when user first opens
            ══════════════════════════════════════════ */}
            {showEntryPopup && (
                <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
                    <div
                        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                        style={{ background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        {/* Top gradient strip */}
                        <div
                            className="h-1.5 w-full"
                            style={{ background: `linear-gradient(90deg, ${theme.btnStart}, ${theme.btnEnd})` }}
                        />
                        <div className="p-5">
                            <div className="text-center mb-4">
                                <div
                                    className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                                    style={{ background: `linear-gradient(135deg, ${theme.btnStart}30, ${theme.btnEnd}20)`, border: `1px solid ${theme.btnStart}40` }}
                                >
                                    🎨
                                </div>
                                <p className="text-lg font-black text-white">Theme Studio</p>
                                <p className="text-xs text-white/40 mt-1">Apni app ka pura look customize karo</p>
                            </div>

                            {/* Info cards */}
                            <div className="space-y-2.5 mb-4">
                                <div
                                    className="flex items-center gap-3 rounded-2xl p-3 border"
                                    style={{ background: '#22c55e12', borderColor: '#22c55e30' }}
                                >
                                    <span className="text-xl shrink-0">🎁</span>
                                    <div>
                                        <p className="text-xs font-black text-green-400">Pehla Theme — BILKUL FREE!</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Pehli baar theme bana ke apply karo, koi coin nahi lagega</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-3 rounded-2xl p-3 border"
                                    style={{ background: `${theme.btnStart}12`, borderColor: `${theme.btnStart}30` }}
                                >
                                    <span className="text-xl shrink-0">🪙</span>
                                    <div>
                                        <p className="text-xs font-black text-white">Theme Change — {THEME_COST} Coins</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Doosri baar ya theme change karne pe {THEME_COST} coins lagenge</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-3 rounded-2xl p-3 border"
                                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}
                                >
                                    <span className="text-xl shrink-0">✨</span>
                                    <div>
                                        <p className="text-xs font-black text-white">14 Color Controls</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Top Bar, Nav, Cards, Buttons, Text — har cheez alag customize karo</p>
                                    </div>
                                </div>
                            </div>

                            {/* Your coins */}
                            <div
                                className="flex items-center justify-between rounded-2xl px-4 py-2.5 mb-4"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <p className="text-xs text-white/50 font-bold">Aapke Paas</p>
                                <p className="text-base font-black text-amber-400">🪙 {isAdmin ? '∞ (Admin)' : totalCoins} coins</p>
                            </div>

                            <button
                                onClick={() => setShowEntryPopup(false)}
                                className="w-full py-3.5 rounded-2xl font-black text-sm text-white active:scale-95 transition-all"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})`,
                                    boxShadow: `0 6px 20px ${theme.btnStart}50`,
                                }}
                            >
                                {isFirstTime ? '🎁 Studio Kholo (Free)' : `🎨 Studio Kholo`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                COIN CONFIRM POPUP — before 2nd+ apply
            ══════════════════════════════════════════ */}
            {showCoinPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(6px)' }}>
                    <div
                        className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl"
                        style={{ background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <div
                            className="h-1.5 w-full"
                            style={{ background: `linear-gradient(90deg, ${theme.btnStart}, ${theme.btnEnd})` }}
                        />
                        <div className="p-5">
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-2">🪙</div>
                                <p className="text-base font-black text-white">Theme Change</p>
                                <p className="text-xs text-white/40 mt-1">Naya theme apply karne ke liye coins spend honge</p>
                            </div>

                            {/* Cost breakdown */}
                            <div
                                className="rounded-2xl p-3.5 mb-4 border"
                                style={{ background: `${theme.btnStart}12`, borderColor: `${theme.btnStart}30` }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-white/50">Aapke paas</p>
                                    <p className="text-sm font-black text-amber-400">🪙 {totalCoins}</p>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-white/50">Theme cost</p>
                                    <p className="text-sm font-black text-red-400">− {THEME_COST} 🪙</p>
                                </div>
                                <div
                                    className="h-px my-2"
                                    style={{ background: 'rgba(255,255,255,0.08)' }}
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-black text-white/70">Apply ke baad</p>
                                    <p className="text-sm font-black" style={{ color: theme.btnStart }}>🪙 {totalCoins - THEME_COST}</p>
                                </div>
                            </div>

                            {totalCoins < THEME_COST ? (
                                <div
                                    className="flex items-center gap-2 rounded-xl p-3 mb-4"
                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                                >
                                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                                    <p className="text-[10px] text-red-300 font-bold">Coins kam hain! {THEME_COST - totalCoins} aur coins chahiye.</p>
                                </div>
                            ) : null}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowCoinPopup(false)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-bold text-sm text-white/50 border border-white/10 active:scale-95 transition-all"
                                    style={{ background: 'rgba(255,255,255,0.04)' }}
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button
                                    onClick={doApply}
                                    disabled={saving || totalCoins < THEME_COST}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all disabled:opacity-40"
                                    style={{
                                        background: totalCoins >= THEME_COST
                                            ? `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})`
                                            : '#374151',
                                        boxShadow: totalCoins >= THEME_COST ? `0 4px 14px ${theme.btnStart}50` : 'none',
                                    }}
                                >
                                    <Sparkles size={14} />
                                    {saving ? 'Applying...' : `Apply (${THEME_COST} 🪙)`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── HEADER ── */}
            <div
                className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3 shadow-xl"
                style={{
                    background: `linear-gradient(135deg, ${theme.topBarStart}, ${theme.topBarEnd})`,
                    boxShadow: `0 4px 20px ${theme.accentGlow}30`,
                }}
            >
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={16} className="text-white" />
                </button>
                <div className="flex-1">
                    <p className="text-sm font-black text-white">🎨 Theme Studio</p>
                    <p className="text-[9px] text-white/60">Har element ka alag color</p>
                </div>
                <div className="flex items-center gap-2">
                    {!isAdmin && (
                        <div
                            className="h-6 rounded-full px-2.5 flex items-center gap-1 text-[9px] font-black"
                            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                        >
                            🪙 {totalCoins}
                        </div>
                    )}
                    {isFirstTime && !isAdmin && (
                        <div
                            className="h-6 rounded-full px-2.5 flex items-center text-[9px] font-black text-green-300"
                            style={{ background: 'rgba(34,197,94,0.2)' }}
                        >
                            FREE 🎁
                        </div>
                    )}
                    {isAdmin && (
                        <div
                            className="h-6 rounded-full px-2.5 flex items-center text-[9px] font-black text-amber-300"
                            style={{ background: 'rgba(245,158,11,0.2)' }}
                        >
                            Admin ∞
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 pt-4 space-y-4">

                {/* ── ACTIVE THEME STATUS ── */}
                <div
                    className="rounded-2xl p-3.5 border"
                    style={{ background: `${theme.btnStart}10`, borderColor: `${theme.btnStart}28` }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Eye size={11} style={{ color: theme.btnStart }} />
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Abhi Active Theme</p>
                    </div>
                    {!isFirstTime ? (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-5 h-5 rounded-full shrink-0 border-2 border-white/20"
                                style={{ background: `linear-gradient(135deg, ${user.personalTheme?.btnStart || theme.btnStart}, ${user.personalTheme?.btnEnd || theme.btnEnd})` }}
                            />
                            <p className="text-sm font-bold text-white flex-1">Custom Theme Active ✅</p>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black text-red-300 border border-red-500/22 active:scale-95 transition-all"
                                style={{ background: 'rgba(239,68,68,0.07)' }}
                            >
                                <RotateCcw size={9} /> Reset
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full shrink-0 border-2 border-white/15" style={{ background: '#3b82f6' }} />
                            <p className="text-sm font-bold text-white/40">Default Theme</p>
                            <span
                                className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full text-green-300"
                                style={{ background: 'rgba(34,197,94,0.15)' }}
                            >
                                🎁 Pehla theme free!
                            </span>
                        </div>
                    )}
                </div>

                {/* ── LIVE PREVIEW ── */}
                <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Eye size={10} /> Live Preview
                    </p>
                    <div
                        className="rounded-3xl overflow-hidden shadow-2xl border"
                        style={{ borderColor: `${theme.accentGlow}22` }}
                    >
                        <div className="px-4 py-3 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${theme.topBarStart}, ${theme.topBarEnd})` }}>
                            <div className="flex-1">
                                <div className="h-2 w-16 rounded-full" style={{ background: theme.textPrimary, opacity: 0.65 }} />
                                <div className="h-1.5 w-24 rounded-full mt-1" style={{ background: theme.textSecondary, opacity: 0.45 }} />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-5 px-2 rounded-full text-[8px] font-black flex items-center" style={{ background: 'rgba(255,255,255,0.18)', color: theme.textPrimary }}>💠 L15</div>
                                <div className="h-5 px-2 rounded-full text-[8px] font-black flex items-center" style={{ background: 'rgba(255,255,255,0.12)', color: theme.textPrimary }}>🪙 {totalCoins}</div>
                            </div>
                        </div>
                        <div className="p-3 space-y-2.5" style={{ background: theme.bgColor }}>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${theme.progressColor}22` }}>
                                <div className="h-full w-3/5 rounded-full" style={{ background: `linear-gradient(90deg, ${theme.progressColor}, ${theme.accentGlow})` }} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[['📚', 'Notes', '24 chapters'], ['🎯', 'MCQ', '500+'], ['🎓', 'Courses', '6 subjects'], ['🏆', 'Rank', 'Top 10%']].map(([e, l, s]) => (
                                    <div key={l} className="rounded-xl p-2.5" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                                        <span className="text-sm">{e}</span>
                                        <p className="text-[9px] font-black mt-1" style={{ color: theme.textPrimary }}>{l}</p>
                                        <p className="text-[8px]" style={{ color: theme.textSecondary }}>{s}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-xl py-2.5 text-center" style={{ background: `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})`, boxShadow: `0 4px 14px ${theme.btnStart}50` }}>
                                <span className="text-[10px] font-black text-white">⚡ Start Learning</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})`, boxShadow: `0 0 12px ${theme.accentGlow}60` }}>
                                    {(user.name || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black" style={{ color: theme.textPrimary }}>{user.name || 'Student'}</p>
                                    <p className="text-[8px]" style={{ color: theme.textSecondary }}>Level 15 • 1200 XP</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 border-t" style={{ background: theme.navBg, borderColor: theme.navBorder }}>
                            {[['🏠', 'Home', true], ['📖', 'Study', false], ['🎯', 'MCQ', false], ['👤', 'Profile', false]].map(([ic, lb, ac]) => (
                                <div key={lb as string} className="flex flex-col items-center py-2.5 gap-0.5" style={{ opacity: ac ? 1 : 0.35 }}>
                                    <span className="text-base">{ic as string}</span>
                                    <p className="text-[8px] font-bold" style={{ color: ac ? theme.navActive : theme.textSecondary }}>{lb as string}</p>
                                    <div className="h-0.5 w-4 rounded-full" style={{ background: ac ? theme.navActive : 'transparent' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PRESET CHIPS ── */}
                <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2.5">Quick Presets</p>
                    <div className="grid grid-cols-4 gap-2">
                        {PRESETS.map(p => {
                            const isActive = theme.topBarStart === p.colors.topBarStart && theme.btnStart === p.colors.btnStart;
                            return (
                                <button
                                    key={p.name}
                                    onClick={() => setTheme({ ...p.colors })}
                                    className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl active:scale-90 transition-all border relative"
                                    style={{
                                        background: isActive ? `${p.colors.btnStart}22` : `${p.colors.btnStart}0d`,
                                        borderColor: isActive ? p.colors.btnStart : 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    {isActive && (
                                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: p.colors.btnStart }}>
                                            <Check size={8} className="text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    <div className="w-8 h-8 rounded-full border-2 border-white/10"
                                        style={{ background: `linear-gradient(135deg, ${p.colors.topBarStart}, ${p.colors.btnEnd})` }} />
                                    <span className="text-[8px] font-black text-white/70">{p.emoji}</span>
                                    <span className="text-[7px] font-bold text-white/45 leading-tight text-center">{p.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── RESET TO DEFAULT ── */}
                <button
                    onClick={() => setTheme({ ...DEFAULT_THEME })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white/30 border border-white/6 active:scale-95 transition-all"
                    style={{ background: '#0d0f1a' }}
                >
                    <RotateCcw size={11} /> Preview Default Pe Reset Karo
                </button>

                {/* ── SECTION TABS ── */}
                <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Palette size={10} /> Granular Controls — Har Element Alag
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                        {SECTIONS.map(sec => {
                            const active = activeSection === sec.id;
                            return (
                                <button
                                    key={sec.id}
                                    onClick={() => setActiveSection(sec.id)}
                                    className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-center active:scale-90 transition-all border"
                                    style={{
                                        background: active ? `${theme.btnStart}22` : '#0d0f1a',
                                        borderColor: active ? `${theme.btnStart}55` : 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <span style={{ color: active ? theme.btnStart : 'rgba(255,255,255,0.30)' }}>{sec.icon}</span>
                                    <span className="text-[7px] font-black leading-tight" style={{ color: active ? theme.textPrimary : 'rgba(255,255,255,0.35)' }}>
                                        {sec.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── SECTION LIVE PREVIEW ── zoomed view of the exact element being edited ── */}
                    <div className="rounded-2xl overflow-hidden mb-3 border" style={{ borderColor: `${theme.btnStart}40`, boxShadow: `0 0 0 1px ${theme.btnStart}25, 0 8px 32px ${theme.btnStart}20` }}>
                        {/* Section label strip */}
                        <div className="flex items-center gap-2 px-3 py-2" style={{ background: `${theme.btnStart}18`, borderBottom: `1px solid ${theme.btnStart}25` }}>
                            <span className="text-xs" style={{ color: theme.btnStart }}>{SECTIONS.find(s => s.id === activeSection)?.icon}</span>
                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest flex-1">Live Preview — {SECTIONS.find(s => s.id === activeSection)?.label}</p>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.btnStart }} />
                        </div>

                        {/* TOPBAR preview */}
                        {activeSection === 'TOPBAR' && (
                            <div className="px-4 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${theme.topBarStart}, ${theme.topBarEnd})` }}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                                            style={{ background: `${theme.btnStart}55`, border: `1.5px solid ${theme.btnStart}80` }}>
                                            {(user.name || 'A')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black leading-none" style={{ color: theme.textPrimary }}>{user.name || 'Admin'}</p>
                                            <p className="text-[9px] leading-none mt-0.5" style={{ color: theme.textSecondary, opacity: 0.7 }}>Namaste! 👋</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-7 px-2.5 rounded-full text-[9px] font-black flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.18)', color: theme.textPrimary }}>💠 L15</div>
                                    <div className="h-7 px-2.5 rounded-full text-[9px] font-black flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.14)', color: theme.textPrimary }}>🪙 {totalCoins}</div>
                                    <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                                        <span className="text-sm">🔔</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NAVIGATION preview */}
                        {activeSection === 'NAVIGATION' && (
                            <div style={{ background: theme.bgColor, padding: '8px 8px 0' }}>
                                <p className="text-[8px] text-white/20 text-center mb-1">— App Content —</p>
                                <div className="grid grid-cols-4 rounded-t-xl overflow-hidden" style={{ background: theme.navBg, borderTop: `1.5px solid ${theme.navBorder}` }}>
                                    {[['🏠', 'Home', true], ['📖', 'Study', false], ['🎯', 'MCQ', false], ['👤', 'Profile', false]].map(([ic, lb, ac]) => (
                                        <div key={lb as string} className="flex flex-col items-center py-3 gap-1" style={{ opacity: ac ? 1 : 0.45 }}>
                                            <span className="text-lg">{ic as string}</span>
                                            <p className="text-[9px] font-bold" style={{ color: ac ? theme.navActive : theme.textSecondary }}>{lb as string}</p>
                                            <div className="h-0.5 w-5 rounded-full" style={{ background: ac ? theme.navActive : 'transparent' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CARDS preview */}
                        {activeSection === 'CARDS' && (
                            <div className="p-3" style={{ background: theme.bgColor }}>
                                <div className="grid grid-cols-2 gap-2">
                                    {[['📚', 'Notes', 'Class 10 · 24 chapters', '#3b82f6'], ['🎯', 'MCQ Practice', '500+ questions', '#8b5cf6'], ['🎓', 'Courses', '6 subjects avail.', '#f59e0b'], ['🏆', 'My Rank', 'Top 10% students', '#10b981']].map(([e, l, s, c]) => (
                                        <div key={l as string} className="rounded-2xl p-3 flex flex-col gap-1.5" style={{ background: theme.cardBg, border: `1.5px solid ${theme.cardBorder}` }}>
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${c}22` }}>
                                                {e as string}
                                            </div>
                                            <p className="text-[10px] font-black leading-tight" style={{ color: theme.textPrimary }}>{l as string}</p>
                                            <p className="text-[8px] leading-tight" style={{ color: theme.textSecondary }}>{s as string}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* BUTTONS preview */}
                        {activeSection === 'BUTTONS' && (
                            <div className="p-4 flex flex-col gap-3" style={{ background: theme.bgColor }}>
                                <button className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
                                    style={{ background: `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})`, boxShadow: `0 6px 20px ${theme.btnStart}55` }}>
                                    <Sparkles size={15} /> Start Learning
                                </button>
                                <button className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
                                    style={{ background: `${theme.btnStart}18`, border: `1.5px solid ${theme.btnStart}40`, color: theme.btnStart }}>
                                    <Star size={13} /> View All Chapters
                                </button>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2.5 rounded-xl font-bold text-[10px] text-white flex items-center justify-center gap-1"
                                        style={{ background: `linear-gradient(135deg, ${theme.btnStart}cc, ${theme.btnEnd})` }}>
                                        ✅ Submit
                                    </button>
                                    <button className="flex-1 py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                                        ✕ Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BACKGROUND preview */}
                        {activeSection === 'BACKGROUND' && (
                            <div className="p-3" style={{ background: theme.bgColor }}>
                                <div className="rounded-2xl p-3 mb-2" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                                    <p className="text-xs font-black text-white/80 mb-1">App Background Color</p>
                                    <p className="text-[9px]" style={{ color: theme.textSecondary }}>Yeh color puri app ke peeche dikhta hai — home screen, notes, MCQ, har jagah.</p>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-12 h-12 rounded-2xl border-2 border-white/10 flex items-center justify-center text-xl"
                                        style={{ background: theme.bgColor, boxShadow: `0 0 0 3px ${theme.btnStart}40` }}>
                                        🎨
                                    </div>
                                    <div>
                                        <p className="text-xs font-black" style={{ color: theme.textPrimary }}>Background</p>
                                        <p className="text-[9px] font-mono" style={{ color: theme.textSecondary }}>{theme.bgColor}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TEXT preview */}
                        {activeSection === 'TEXT' && (
                            <div className="p-4 flex flex-col gap-3" style={{ background: theme.bgColor }}>
                                <div>
                                    <p className="text-base font-black leading-tight" style={{ color: theme.textPrimary }}>Rajasthan Geography</p>
                                    <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.textSecondary }}>Rajasthan India ka sabse bada rajya hai. Iska total area 342,239 km² hai aur population approximately 8 crore se zyada hai.</p>
                                </div>
                                <div className="h-px" style={{ background: `${theme.textSecondary}25` }} />
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                                        style={{ background: `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})` }}>A</div>
                                    <div>
                                        <p className="text-[11px] font-bold leading-none" style={{ color: theme.textPrimary }}>Primary Text</p>
                                        <p className="text-[9px] leading-none mt-0.5" style={{ color: theme.textSecondary }}>Secondary / subtitle text</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACCENTS preview */}
                        {activeSection === 'ACCENTS' && (
                            <div className="p-4 flex flex-col gap-4" style={{ background: theme.bgColor }}>
                                <div>
                                    <div className="flex justify-between mb-1.5">
                                        <p className="text-[9px] font-black" style={{ color: theme.textPrimary }}>Daily Progress</p>
                                        <p className="text-[9px] font-bold" style={{ color: theme.progressColor }}>72%</p>
                                    </div>
                                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: `${theme.progressColor}20` }}>
                                        <div className="h-full rounded-full w-[72%] transition-all" style={{ background: `linear-gradient(90deg, ${theme.progressColor}, ${theme.accentGlow})` }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white"
                                            style={{ background: `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})`, boxShadow: `0 0 0 3px ${theme.accentGlow}50, 0 0 20px ${theme.accentGlow}40` }}>
                                            {(user.name || 'A')[0].toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-black"
                                            style={{ background: theme.accentGlow }}>15</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black" style={{ color: theme.textPrimary }}>{user.name || 'Admin'}</p>
                                        <p className="text-[9px]" style={{ color: theme.textSecondary }}>Level 15 · 1,250 XP</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="h-1.5 rounded-full w-20" style={{ background: `${theme.progressColor}22` }}>
                                                <div className="h-full rounded-full w-[60%]" style={{ background: theme.progressColor }} />
                                            </div>
                                            <p className="text-[8px]" style={{ color: theme.progressColor }}>750/1250</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl p-4 border" style={{ background: '#0d0f1a', borderColor: `${theme.btnStart}18` }}>
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/5">
                            <span style={{ color: theme.btnStart }}>{SECTIONS.find(s => s.id === activeSection)?.icon}</span>
                            <div>
                                <p className="text-xs font-black text-white">{SECTIONS.find(s => s.id === activeSection)?.label}</p>
                                <p className="text-[9px] text-white/30">{SECTIONS.find(s => s.id === activeSection)?.desc}</p>
                            </div>
                        </div>
                        {sectionColors[activeSection]}
                    </div>
                </div>

                {/* ── APPLY BUTTONS ── */}
                <div className="flex gap-2.5 pt-1">
                    {!isFirstTime && (
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl font-bold text-xs text-red-300 border border-red-500/20 active:scale-95 transition-all shrink-0"
                            style={{ background: 'rgba(239,68,68,0.07)' }}
                        >
                            <RotateCcw size={12} /> Default
                        </button>
                    )}
                    <button
                        onClick={handleApplyClick}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white active:scale-95 transition-all disabled:opacity-60"
                        style={{
                            background: `linear-gradient(135deg, ${theme.btnStart}, ${theme.btnEnd})`,
                            boxShadow: `0 6px 24px ${theme.btnStart}55`,
                        }}
                    >
                        <Sparkles size={16} />
                        {saving ? 'Saving...' : 'Apni Profile Pe Apply'}
                    </button>
                </div>

                {/* ── ADMIN GLOBAL BROADCAST BUTTON ── */}
                {isAdmin && (
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => setShowGlobalPopup(true)}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm text-white active:scale-95 transition-all disabled:opacity-60 border"
                            style={{
                                background: 'rgba(99,102,241,0.15)',
                                borderColor: 'rgba(99,102,241,0.35)',
                            }}
                        >
                            <Globe size={15} className="text-indigo-400" />
                            <span className="text-indigo-300">App Pe Globally Apply</span>
                        </button>
                        {liveAdminTheme && (
                            <button
                                onClick={doRemoveGlobal}
                                disabled={saving}
                                className="px-4 py-3 rounded-2xl font-bold text-xs text-orange-300 border border-orange-500/20 active:scale-95 transition-all shrink-0"
                                style={{ background: 'rgba(249,115,22,0.07)' }}
                            >
                                Hataao
                            </button>
                        )}
                    </div>
                )}
                {isAdmin && liveAdminTheme && (
                    <div className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <Globe size={11} className="text-indigo-400 shrink-0" />
                        <p className="text-[10px] text-indigo-300 flex-1">
                            Global theme active — {liveAdminTheme.targetTier === 'all' ? 'Sabhi users' : liveAdminTheme.targetTier.toUpperCase()}
                            {liveAdminTheme.expiresAt ? ` · expires ${new Date(liveAdminTheme.expiresAt).toLocaleDateString('en-IN')}` : ' · Permanent'}
                        </p>
                    </div>
                )}

                <p className="text-[8px] text-white/20 text-center pb-4">
                    {isAdmin
                        ? 'Admin ko coins nahi lagte · Global Apply se puri app ke users ka theme badlega'
                        : isFirstTime
                            ? `✨ Pehla theme free! Iske baad ${THEME_COST} coins lagenge`
                            : 'Ye theme permanently rahegi jab tak tum khud reset nahi karte'}
                </p>
            </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ADMIN GLOBAL APPLY POPUP
        ══════════════════════════════════════════════════ */}

        {showGlobalPopup && (
            <div className="fixed inset-0 z-[300] flex items-end justify-center pb-6 px-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
                <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ background: '#0d0f1a', border: '1px solid rgba(99,102,241,0.3)' }}>
                    {/* Header */}
                    <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg,#3730a3,#1e1b4b)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Globe size={18} className="text-indigo-300" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-black text-sm">App Pe Apply Karo</p>
                            <p className="text-indigo-300/70 text-[10px]">Yeh theme selected users ko milegi</p>
                        </div>
                        <button onClick={() => setShowGlobalPopup(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                            <X size={13} className="text-white/70" />
                        </button>
                    </div>

                    <div className="p-5 flex flex-col gap-5">
                        {/* Duration */}
                        <div>
                            <div className="flex items-center gap-2 mb-2.5">
                                <Clock size={13} className="text-indigo-400" />
                                <p className="text-white text-xs font-bold">Kitne Time Ke Liye?</p>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {([['permanent','Permanent'],['24h','24 Ghante'],['7d','7 Din'],['30d','30 Din']] as const).map(([val,label]) => (
                                    <button key={val} onClick={() => setGlobalDuration(val)}
                                        className="py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                                        style={{
                                            background: globalDuration === val ? `linear-gradient(135deg,${theme.btnStart},${theme.btnEnd})` : 'rgba(255,255,255,0.06)',
                                            color: globalDuration === val ? '#fff' : 'rgba(255,255,255,0.5)',
                                            border: `1px solid ${globalDuration === val ? theme.btnStart + '80' : 'transparent'}`,
                                        }}
                                    >{label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Tier */}
                        <div>
                            <div className="flex items-center gap-2 mb-2.5">
                                <Users size={13} className="text-indigo-400" />
                                <p className="text-white text-xs font-bold">Kis Tier Ko Mileg?</p>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {([['all','Sabhi'],['ultra','ULTRA'],['basic','BASIC'],['free','FREE']] as const).map(([val,label]) => (
                                    <button key={val} onClick={() => setGlobalTier(val)}
                                        className="py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                                        style={{
                                            background: globalTier === val ? `linear-gradient(135deg,${theme.btnStart},${theme.btnEnd})` : 'rgba(255,255,255,0.06)',
                                            color: globalTier === val ? '#fff' : 'rgba(255,255,255,0.5)',
                                            border: `1px solid ${globalTier === val ? theme.btnStart + '80' : 'transparent'}`,
                                        }}
                                    >{label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Level Range */}
                        <div>
                            <div className="flex items-center gap-2 mb-2.5">
                                <BarChart2 size={13} className="text-indigo-400" />
                                <p className="text-white text-xs font-bold">Level Range <span className="text-white/30 font-normal">(0 = koi limit nahi)</span></p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <p className="text-white/40 text-[9px] mb-1">Min Level</p>
                                    <input
                                        type="number" min={0} max={20} value={globalMinLevel}
                                        onChange={e => setGlobalMinLevel(parseInt(e.target.value) || 0)}
                                        className="w-full rounded-xl px-3 py-2.5 text-sm font-bold text-white text-center outline-none"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white/40 text-[9px] mb-1">Max Level</p>
                                    <input
                                        type="number" min={0} max={20} value={globalMaxLevel}
                                        onChange={e => setGlobalMaxLevel(parseInt(e.target.value) || 0)}
                                        className="w-full rounded-xl px-3 py-2.5 text-sm font-bold text-white text-center outline-none"
                                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-2xl p-3 text-center" style={{ background: `${theme.btnStart}15`, border: `1px solid ${theme.btnStart}30` }}>
                            <p className="text-white/60 text-[10px]">
                                <span className="text-white font-bold">{globalTier === 'all' ? 'Sabhi users' : globalTier.toUpperCase() + ' users'}</span>
                                {globalMinLevel > 0 || globalMaxLevel > 0 ? ` · Level ${globalMinLevel || 1}${globalMaxLevel > 0 ? '–' + globalMaxLevel : '+'}` : ''}
                                {' '}ko{' '}
                                <span className="text-white font-bold">{globalDuration === 'permanent' ? 'permanently' : globalDuration === '24h' ? '24 ghante' : globalDuration === '7d' ? '7 din' : '30 din'}</span>
                                {' '}ke liye theme milegi
                            </p>
                        </div>

                        {/* Confirm */}
                        <button
                            onClick={doGlobalApply}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white active:scale-95 transition-all disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg,${theme.btnStart},${theme.btnEnd})`, boxShadow: `0 6px 24px ${theme.btnStart}55` }}
                        >
                            <Globe size={16} />
                            {saving ? 'Applying...' : 'App Pe Apply Karo ✓'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};
