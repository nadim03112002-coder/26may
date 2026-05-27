import { User } from '../types';

export type UserTier = 'ultra' | 'basic' | 'free';

export const getUserTier = (
  user: Pick<User, 'isPremium' | 'subscriptionLevel' | 'subscriptionEndDate'>
): UserTier => {
  const isActive = user.isPremium
    ? user.subscriptionEndDate
      ? new Date(user.subscriptionEndDate) > new Date()
      : true
    : false;
  if (isActive && (user.subscriptionLevel === 'ULTRA' || (user.subscriptionLevel as any) === 'PRO'))
    return 'ultra';
  if (isActive && user.subscriptionLevel === 'BASIC') return 'basic';
  return 'free';
};

export const TIER_THEME = {
  ultra: {
    tier: 'ultra' as UserTier,
    primary:       '#c8a020',
    mid:           '#e6c84a',
    light:         '#fef3c7',
    border:        '#c8a020',
    borderSoft:    '#fde68a',
    text:          '#92700f',
    soft:          '#fffbeb',
    navGlow:       'rgba(200,160,32,0.16)',
    navBorder:     'rgba(200,160,32,0.22)',
    navRing:       'rgba(200,160,32,0.24)',
    pillGrad:      'linear-gradient(90deg,#7a5c10,#c8a020,#e6c84a)',
    topBarGrad:    'linear-gradient(135deg,#0d0540 0%,#120660 50%,#0d0540 100%)',
    btnGrad:       'linear-gradient(135deg,#7a5c10,#c8a020)',
    shadowColor:   'rgba(200,160,32,0.32)',
    profileBg:     '#07051a',
    profileCardBg: '#100d24',
    label:         'ULTRA',
    emoji:         '⚡',
  },
  basic: {
    tier: 'basic' as UserTier,
    primary:       '#2563eb',
    mid:           '#3b82f6',
    light:         '#dbeafe',
    border:        '#60a5fa',
    borderSoft:    '#bfdbfe',
    text:          '#1d4ed8',
    soft:          '#eff6ff',
    navGlow:       'rgba(37,99,235,0.14)',
    navBorder:     'rgba(37,99,235,0.20)',
    navRing:       'rgba(37,99,235,0.22)',
    pillGrad:      'linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)',
    topBarGrad:    'linear-gradient(135deg,#060c1a 0%,#0a1535 50%,#060c1a 100%)',
    btnGrad:       'linear-gradient(135deg,#2563eb,#3b82f6)',
    shadowColor:   'rgba(37,99,235,0.28)',
    profileBg:     '#050d1e',
    profileCardBg: '#091528',
    label:         'BASIC',
    emoji:         '⭐',
  },
  free: {
    tier: 'free' as UserTier,
    primary:       '#10b981',
    mid:           '#34d399',
    light:         '#d1fae5',
    border:        '#6ee7b7',
    borderSoft:    '#a7f3d0',
    text:          '#065f46',
    soft:          '#ecfdf5',
    navGlow:       'rgba(16,185,129,0.14)',
    navBorder:     'rgba(16,185,129,0.20)',
    navRing:       'rgba(16,185,129,0.22)',
    pillGrad:      'linear-gradient(90deg,#059669,#10b981,#34d399)',
    topBarGrad:    'linear-gradient(135deg,#e0f7ff 0%,#bae6fd 50%,#e0f7ff 100%)',
    btnGrad:       'linear-gradient(135deg,#059669,#10b981)',
    shadowColor:   'rgba(16,185,129,0.22)',
    profileBg:     '#050f0a',
    profileCardBg: '#091510',
    label:         'FREE',
    emoji:         '🎓',
  },
} as const;

export const getTierTheme = (
  user: Pick<User, 'isPremium' | 'subscriptionLevel' | 'subscriptionEndDate'>
) => TIER_THEME[getUserTier(user)];

export const buildOverrideTierTheme = (
  base: typeof TIER_THEME[UserTier],
  hexColor: string
) => {
  const hex = hexColor.replace('#', '').padEnd(6, '0');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const rD = Math.round(r * 0.12), gD = Math.round(g * 0.12), bD = Math.round(b * 0.12);
  const rM = Math.round(r * 0.20), gM = Math.round(g * 0.20), bM = Math.round(b * 0.20);
  const rBg = Math.max(Math.round(r * 0.07), 3);
  const gBg = Math.max(Math.round(g * 0.07), 3);
  const bBg = Math.max(Math.round(b * 0.07), 3);
  const rCBg = Math.max(Math.round(r * 0.13), 5);
  const gCBg = Math.max(Math.round(g * 0.13), 5);
  const bCBg = Math.max(Math.round(b * 0.13), 5);
  return {
    ...base,
    primary:      hexColor,
    mid:          hexColor,
    border:       `rgba(${r},${g},${b},0.70)`,
    borderSoft:   `rgba(${r},${g},${b},0.28)`,
    text:         hexColor,
    navGlow:      `rgba(${r},${g},${b},0.16)`,
    navBorder:    `rgba(${r},${g},${b},0.22)`,
    navRing:      `rgba(${r},${g},${b},0.24)`,
    pillGrad:     `linear-gradient(90deg,${hexColor}bb,${hexColor},${hexColor}dd)`,
    btnGrad:      `linear-gradient(135deg,${hexColor}cc,${hexColor})`,
    shadowColor:  `rgba(${r},${g},${b},0.32)`,
    topBarGrad:   `linear-gradient(135deg,rgb(${rD},${gD},${bD}) 0%,rgb(${rM},${gM},${bM}) 50%,rgb(${rD},${gD},${bD}) 100%)`,
    profileBg:    `rgb(${rBg},${gBg},${bBg})`,
    profileCardBg:`rgb(${rCBg},${gCBg},${bCBg})`,
  };
};

// Build subColor helpers (for UniversalChat / FullBookCompare) from a hex color
export const buildSubColorsFromHex = (hexColor: string) => {
  const hex = hexColor.replace('#', '').padEnd(6, '0');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return {
    subColor:       hexColor,
    subColorLight:  `rgba(${r},${g},${b},0.08)`,
    subColorBorder: `rgba(${r},${g},${b},0.30)`,
  };
};

// Named theme presets for admin
export const ADMIN_NAMED_THEMES = [
  { id: 'GOLD',    name: 'Gold',       color: '#c8a020', emoji: '⚡' },
  { id: 'ROYAL',   name: 'Royal Blue', color: '#2563eb', emoji: '👑' },
  { id: 'NAVY',    name: 'Navy',       color: '#1e3a8a', emoji: '💙' },
  { id: 'EMERALD', name: 'Emerald',    color: '#059669', emoji: '💚' },
  { id: 'RUBY',    name: 'Ruby',       color: '#e11d48', emoji: '❤️' },
  { id: 'VIOLET',  name: 'Violet',     color: '#7c3aed', emoji: '💜' },
  { id: 'ORANGE',  name: 'Sunset',     color: '#f97316', emoji: '🔥' },
  { id: 'CYAN',    name: 'Cyan',       color: '#0891b2', emoji: '🌊' },
  { id: 'PINK',    name: 'Pink',       color: '#db2777', emoji: '🌸' },
  { id: 'LIME',    name: 'Lime',       color: '#65a30d', emoji: '🍀' },
  { id: 'SILVER',  name: 'Silver',     color: '#64748b', emoji: '⚪' },
  { id: 'MAROON',  name: 'Maroon',     color: '#9f1239', emoji: '🍷' },
] as const;

// Build a FULL tier-theme object from granular personalTheme colors.
// This ensures the new theme COMPLETELY replaces the old one — no layering.
export const buildGranularTierTheme = (
  base: typeof TIER_THEME[UserTier],
  t: {
    bgColor?: string; topBarStart?: string; topBarEnd?: string;
    navBg?: string; navBorder?: string; navActive?: string;
    cardBg?: string; cardColor?: string; cardBorder?: string;
    btnStart?: string; btnEnd?: string; accentColor?: string;
    textColor?: string; textSecondary?: string;
    accentGlow?: string; progressColor?: string;
  }
): typeof TIER_THEME[UserTier] => {
  const accent = t.btnStart || t.accentColor || base.primary;
  const hex = accent.replace('#', '').padEnd(6, '0');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const topBarGrad = (t.topBarStart && t.topBarEnd)
    ? `linear-gradient(135deg,${t.topBarStart},${t.topBarEnd})`
    : `linear-gradient(135deg,rgb(${Math.round(r*0.12)},${Math.round(g*0.12)},${Math.round(b*0.12)}) 0%,rgb(${Math.round(r*0.20)},${Math.round(g*0.20)},${Math.round(b*0.20)}) 50%,rgb(${Math.round(r*0.12)},${Math.round(g*0.12)},${Math.round(b*0.12)}) 100%)`;
  const btnGrad = (t.btnStart && t.btnEnd)
    ? `linear-gradient(135deg,${t.btnStart},${t.btnEnd})`
    : `linear-gradient(135deg,${accent}cc,${accent})`;
  return {
    ...base,
    primary:       accent,
    mid:           t.accentGlow || accent,
    border:        `rgba(${r},${g},${b},0.70)`,
    borderSoft:    `rgba(${r},${g},${b},0.28)`,
    text:          accent,
    navGlow:       `rgba(${r},${g},${b},0.16)`,
    navBorder:     t.navBorder  ? `1px solid ${t.navBorder}` : `rgba(${r},${g},${b},0.22)`,
    navRing:       `rgba(${r},${g},${b},0.24)`,
    pillGrad:      `linear-gradient(90deg,${accent}bb,${accent},${accent}dd)`,
    btnGrad,
    shadowColor:   `rgba(${r},${g},${b},0.32)`,
    topBarGrad,
    profileBg:     t.bgColor    || base.profileBg,
    profileCardBg: t.cardBg     || t.cardColor || base.profileCardBg,
  };
};

// Get the effective theme override color:
//   1. user.tempThemeColor (if not expired) — personal redeem code color
//   2. adminActiveTheme.color (if not expired) — admin temporary global theme
//   3. Tier-specific color from settings (ultraThemeColor / basicThemeColor / freeThemeColor)
//   4. settingsThemeColor — admin global color (applied to all tiers)
//   5. null — use default tierTheme
export const getEffectiveOverrideColor = (
  user: Pick<User, 'tempThemeColor' | 'tempThemeColorExpiry' | 'isPremium' | 'subscriptionLevel' | 'subscriptionEndDate'> & { personalThemeColor?: string },
  settingsThemeColor?: string,
  tierSettings?: {
    ultraThemeColor?: string;
    basicThemeColor?: string;
    freeThemeColor?: string;
    adminActiveTheme?: { id: string; name: string; color: string; expiresAt?: string };
  } | null
): string | null => {
  // 1. Personal redeem theme (highest priority — from redeem code, expires)
  if (user.tempThemeColor && user.tempThemeColorExpiry) {
    if (new Date(user.tempThemeColorExpiry) > new Date()) {
      return user.tempThemeColor;
    }
  }
  // 2. User's own permanently chosen theme (from ThemeCustomizer)
  if (user.personalThemeColor) return user.personalThemeColor;
  // 3. Admin temporary global theme (with expiry check)
  if (tierSettings?.adminActiveTheme?.color) {
    const theme = tierSettings.adminActiveTheme;
    if (!theme.expiresAt || new Date(theme.expiresAt) > new Date()) {
      return theme.color;
    }
  }
  // 4. Tier-specific permanent color
  if (tierSettings) {
    const tier = getUserTier(user);
    const tierColor =
      tier === 'ultra' ? tierSettings.ultraThemeColor :
      tier === 'basic' ? tierSettings.basicThemeColor :
      tierSettings.freeThemeColor;
    if (tierColor) return tierColor;
  }
  // 5. Global admin color
  if (settingsThemeColor) return settingsThemeColor;
  return null;
};
