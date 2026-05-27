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
    primary:       '#1e3a8a',
    mid:           '#1d4ed8',
    light:         '#dbeafe',
    border:        '#60a5fa',
    borderSoft:    '#bfdbfe',
    text:          '#1e40af',
    soft:          '#eff6ff',
    navGlow:       'rgba(30,58,138,0.15)',
    navBorder:     'rgba(30,58,138,0.18)',
    navRing:       'rgba(30,58,138,0.2)',
    pillGrad:      'linear-gradient(90deg,#1e3a8a,#1d4ed8)',
    topBarGrad:    'linear-gradient(135deg,#0F172A 0%,#1E2A4A 50%,#1A2F5E 100%)',
    btnGrad:       'linear-gradient(135deg,#1e3a8a,#1d4ed8)',
    shadowColor:   'rgba(30,58,138,0.3)',
    label:         'ULTRA',
    emoji:         '⚡',
  },
  basic: {
    tier: 'basic' as UserTier,
    primary:       '#2563eb',
    mid:           '#3b82f6',
    light:         '#dbeafe',
    border:        '#93c5fd',
    borderSoft:    '#bfdbfe',
    text:          '#1d4ed8',
    soft:          '#eff6ff',
    navGlow:       'rgba(37,99,235,0.14)',
    navBorder:     'rgba(37,99,235,0.18)',
    navRing:       'rgba(37,99,235,0.2)',
    pillGrad:      'linear-gradient(90deg,#2563eb,#3b82f6)',
    topBarGrad:    'linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 50%,#1E40AF 100%)',
    btnGrad:       'linear-gradient(135deg,#2563eb,#3b82f6)',
    shadowColor:   'rgba(37,99,235,0.25)',
    label:         'BASIC',
    emoji:         '⭐',
  },
  free: {
    tier: 'free' as UserTier,
    primary:       '#0ea5e9',
    mid:           '#38bdf8',
    light:         '#e0f2fe',
    border:        '#7dd3fc',
    borderSoft:    '#bae6fd',
    text:          '#0284c7',
    soft:          '#f0f9ff',
    navGlow:       'rgba(14,165,233,0.14)',
    navBorder:     'rgba(14,165,233,0.18)',
    navRing:       'rgba(14,165,233,0.2)',
    pillGrad:      'linear-gradient(90deg,#0ea5e9,#38bdf8)',
    topBarGrad:    'linear-gradient(135deg,#38BDF8 0%,#5B8FF9 55%,#6366F1 100%)',
    btnGrad:       'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    shadowColor:   'rgba(14,165,233,0.2)',
    label:         'FREE',
    emoji:         '🎓',
  },
} as const;

export const getTierTheme = (
  user: Pick<User, 'isPremium' | 'subscriptionLevel' | 'subscriptionEndDate'>
) => TIER_THEME[getUserTier(user)];
