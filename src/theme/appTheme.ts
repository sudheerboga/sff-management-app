import type { CSSProperties } from 'react';

export interface AppTheme {
  isDark: boolean;
  mode: 'light' | 'dark';
  bg: string;
  bg2: string;
  card: string;
  border: string;
  borderAccent: string;
  text: string;
  text2: string;
  muted: string;
  inputBg: string;
  inputFocusBg: string;
  fontBody: string;
  fontDisplay: string;
  rose:   { d: string; l: string; dk: string; pale: string; muted: string };
  violet: { d: string; l: string; dk: string; pale: string; muted: string };
  blue:   { d: string; l: string; dk: string; pale: string; muted: string };
  gold:   { d: string; l: string; dk: string; pale: string; muted: string };
  grad: {
    brand: string;
    brandV: string;
    card: string;
    gold: string;
    soft: string;
    rose: string;
    violet: string;
  };
  r:  { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; pill: number };
  sp: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; page: number };
  sh: {
    xs: string; sm: string; md: string; lg: string;
    card: string; brand: string; violet: string; rose: string; gold: string; inner: string;
  };
  success: { text: string; bg: string; border: string };
  warning: { text: string; bg: string; border: string };
  danger:  { text: string; bg: string; border: string };
}

const R = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32, pill: 999 };
const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, page: 20 };
const FONTS = {
  fontBody: "'Jost', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
};

export function buildT(
  mode: 'light' | 'dark',
  primaryColor = '#7B5EA7',
  secondaryColor = '#C96B9A',
  accentColor = '#4A6FD4',
): AppTheme {
  const isDark = mode === 'dark';
  const V = primaryColor;
  const RS = secondaryColor;
  const BL = accentColor;

  const grad = {
    brand:  `linear-gradient(135deg,${BL} 0%,${V} 40%,${RS} 100%)`,
    brandV: `linear-gradient(180deg,${BL} 0%,${V} 50%,${RS} 100%)`,
    card:   `linear-gradient(135deg,${V}0F 0%,${RS}0A 100%)`,
    gold:   'linear-gradient(135deg,#B8922A 0%,#D4AF6F 50%,#E8CC8A 100%)',
    soft:   'linear-gradient(135deg,#f3eff9 0%,#fdf0f6 50%,#eef2fc 100%)',
    rose:   `linear-gradient(135deg,${RS},${V})`,
    violet: `linear-gradient(135deg,${V},${BL})`,
  };

  return {
    isDark,
    mode,
    ...FONTS,
    r: R,
    sp: SP,
    grad,

    bg:            isDark ? '#0d0a18' : '#fdfaf7',
    bg2:           isDark ? '#110e20' : 'rgb(255, 255, 255)',
    card:          isDark ? '#16122a' : '#ffffff',
    border:        isDark ? 'rgba(240,234,248,0.08)' : 'rgba(0,0,0,0.08)',
    borderAccent:  isDark ? 'rgba(155,127,212,0.3)' : 'rgba(123,94,167,0.25)',
    text:          isDark ? '#f0eaf8' : '#1a1625',
    text2:         isDark ? 'rgba(240,234,248,0.65)' : '#5a5468',
    muted:         isDark ? 'rgba(240,234,248,0.35)' : 'rgba(26,22,37,0.45)',
    inputBg:       isDark ? 'rgba(255,255,255,0.04)' : 'rgb(253 250 248)',
    inputFocusBg:  isDark ? 'rgba(155,127,212,0.08)' : '#ffffff',

    rose: {
      d: RS, l: '#E8A0BF', dk: '#A0566A',
      pale: isDark ? `${RS}1F` : `${RS}14`,
      muted: isDark ? `${RS}3F` : `${RS}22`,
    },
    violet: {
      d: V, l: '#A08CC8', dk: '#5A3F86',
      pale: isDark ? `${V}1F` : `${V}14`,
      muted: isDark ? `${V}3F` : `${V}22`,
    },
    blue: {
      d: BL, l: '#7A9CE8', dk: '#2E4FA8',
      pale: isDark ? `${BL}1F` : `${BL}14`,
      muted: isDark ? `${BL}3F` : `${BL}22`,
    },
    gold: {
      d: '#D4AF6F', l: '#E8CC8A', dk: '#B8922A',
      pale: isDark ? 'rgba(212,175,111,0.10)' : 'rgba(212,175,111,0.12)',
      muted: isDark ? 'rgba(212,175,111,0.22)' : 'rgba(212,175,111,0.25)',
    },

    sh: isDark ? {
      xs:     '0 1px 4px rgba(0,0,0,.4)',
      sm:     '0 2px 12px rgba(0,0,0,.5)',
      md:     '0 4px 24px rgba(0,0,0,.6)',
      lg:     '0 8px 40px rgba(0,0,0,.7)',
      card:   '0 4px 24px rgba(0,0,0,.5),0 1px 0 rgba(255,255,255,.06)',
      brand:  '0 6px 24px rgba(123,94,167,.4)',
      violet: '0 8px 28px rgba(123,94,167,.3)',
      rose:   '0 8px 28px rgba(201,107,154,.25)',
      gold:   '0 6px 24px rgba(212,175,111,.22)',
      inner:  'inset 0 1px 0 rgba(255,255,255,.06)',
    } : {
      xs:     '0 1px 4px rgba(26,22,37,.06)',
      sm:     '0 2px 10px rgba(26,22,37,.08)',
      md:     '0 4px 20px rgba(26,22,37,.10)',
      lg:     '0 8px 32px rgba(26,22,37,.12)',
      card:   '0 2px 16px rgba(26,22,37,.07)',
      brand:  '0 6px 20px rgba(123,94,167,.28)',
      violet: '0 8px 28px rgba(123,94,167,.22)',
      rose:   '0 8px 28px rgba(201,107,154,.22)',
      gold:   '0 6px 20px rgba(212,175,111,.2)',
      inner:  'inset 0 1px 3px rgba(26,22,37,.06)',
    },

    success: isDark
      ? { text: '#4ade80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.2)' }
      : { text: '#1e6b3e', bg: '#e8f5ee', border: 'rgba(30,107,62,0.18)' },
    warning: isDark
      ? { text: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.2)' }
      : { text: '#7a4f00', bg: '#fff3dc', border: 'rgba(122,79,0,0.18)' },
    danger: isDark
      ? { text: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.2)' }
      : { text: '#8b2020', bg: '#fdeaea', border: 'rgba(139,32,32,0.18)' },
  };
}

export function inputBase(focused = false, T: AppTheme): CSSProperties {
  return {
    width: '100%',
    padding: '13px 16px',
    border: `1.5px solid ${focused ? T.violet.d : T.border}`,
    borderRadius: T.r.md,
    fontSize: 15,
    fontFamily: T.fontBody,
    background: focused ? T.inputFocusBg : T.inputBg,
    color: T.text,
    outline: 'none',
    transition: 'all .2s cubic-bezier(.4,0,.2,1)',
    boxShadow: focused
      ? `0 0 0 3px ${T.isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.12)'},${T.sh.sm}`
      : T.sh.inner,
    WebkitTextFillColor: T.text,
    boxSizing: 'border-box' as const,
  };
}
