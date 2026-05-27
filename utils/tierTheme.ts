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
    topBarGrad:    'linear-gradient(135deg,#080810 0%,#0d0d18 50%,#080810 100%)',
    btnGrad:       'linear-gradient(135deg,#7a5c10,#c8a020)',
    shadowColor:   'rgba(200,160,32,0.32)',
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
    topBarGrad:    'linear-gradient(135deg,#080810 0%,#0d0d18 50%,#080810 100%)',
    btnGrad:       'linear-gradient(135deg,#2563eb,#3b82f6)',
    shadowColor:   'rgba(37,99,235,0.28)',
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
    topBarGrad:    'linear-gradient(135deg,#080810 0%,#0d0d18 50%,#080810 100%)',
    btnGrad:       'linear-gradient(135deg,#059669,#10b981)',
    shadowColor:   'rgba(16,185,129,0.22)',
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
  const rd = Math.max(0, r - 20);
  const gd = Math.max(0, g - 20);
  const bd = Math.max(0, b - 20);
  return {
    ...base,
    primary:     hexColor,
    mid:         hexColor,
    border:      `rgba(${r},${g},${b},0.70)`,
    borderSoft:  `rgba(${r},${g},${b},0.28)`,
    text:        hexColor,
    navGlow:     `rgba(${r},${g},${b},0.16)`,
    navBorder:   `rgba(${r},${g},${b},0.22)`,
    navRing:     `rgba(${r},${g},${b},0.24)`,
    pillGrad:    `linear-gradient(90deg,${hexColor}bb,${hexColor},${hexColor}dd)`,
    btnGrad:     `linear-gradient(135deg,${hexColor}cc,${hexColor})`,
    shadowColor: `rgba(${r},${g},${b},0.32)`,
    topBarGrad:  `linear-gradient(135deg,rgba(${rd},${gd},${bd},0.85) 0%,rgba(${r},${g},${b},0.65) 50%,rgba(${rd},${gd},${bd},0.85) 100%)`,
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

// Get the effective theme override color:
//   1. user.tempThemeColor (if not expired) — personal redeem code color
//   2. settingsThemeColor — admin global subscription color
//   3. null — use default tierTheme
export const getEffectiveOverrideColor = (
  user: { tempThemeColor?: string; tempThemeColorExpiry?: string },
  settingsThemeColor?: string
): string | null => {
  if (user.tempThemeColor && user.tempThemeColorExpiry) {
    if (new Date(user.tempThemeColorExpiry) > new Date()) {
      return user.tempThemeColor;
    }
  }
  if (settingsThemeColor) return settingsThemeColor;
  return null;
};
