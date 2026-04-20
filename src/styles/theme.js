// Sri Fashion Fusion — v7 Theme (Light + Dark)
// Matches website theme.ts exactly

// ── Light palette ────────────────────────────────────────────────
export const LIGHT = {
  bg:    '#f9f5f0',
  bg2:   '#f0ebe4',
  bg3:   '#e8e2da',
  card:  '#ffffff',
  border:'rgba(0,0,0,0.08)',
  borderAccent:'rgba(123,94,167,0.25)',
  glass: 'rgba(255,255,255,0.85)',
  text:  '#1a1625',
  text2: '#5a5468',
  muted: 'rgba(26,22,37,0.45)',
  success:{ text:'#1e6b3e', bg:'#e8f5ee', border:'rgba(30,107,62,0.18)' },
  warning:{ text:'#7a4f00', bg:'#fff3dc', border:'rgba(122,79,0,0.18)' },
  danger: { text:'#8b2020', bg:'#fdeaea', border:'rgba(139,32,32,0.18)' },
  meshBg: 'radial-gradient(ellipse at 20% 50%,rgba(123,94,167,0.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(201,107,154,0.06) 0%,transparent 60%)',
  shellBg:'#e8e3f0',
  headerBg:'rgba(249,245,240,0.92)',
  navBg:  'rgba(255,255,255,0.95)',
  inputBg:'#f9f5f0',
  inputFocusBg:'#ffffff',
  sh:{
    xs:'0 1px 4px rgba(26,22,37,.06)',
    sm:'0 2px 10px rgba(26,22,37,.08)',
    md:'0 4px 20px rgba(26,22,37,.10)',
    lg:'0 8px 32px rgba(26,22,37,.12)',
    card:'0 2px 16px rgba(26,22,37,.07)',
    rose:'0 8px 28px rgba(201,107,154,.22)',
    violet:'0 8px 28px rgba(123,94,167,.22)',
    brand:'0 6px 20px rgba(123,94,167,.28)',
    gold:'0 6px 20px rgba(212,175,111,.2)',
    inner:'inset 0 1px 3px rgba(26,22,37,.06)',
    glow:'0 0 40px rgba(123,94,167,.08)',
  },
};

// ── Dark palette ─────────────────────────────────────────────────
export const DARK = {
  bg:    '#0d0a18',
  bg2:   '#110e20',
  bg3:   '#1a1530',
  card:  '#16122a',
  border:'rgba(240,234,248,0.08)',
  borderAccent:'rgba(155,127,212,0.3)',
  glass: 'rgba(255,255,255,0.05)',
  text:  '#f0eaf8',
  text2: 'rgba(240,234,248,0.65)',
  muted: 'rgba(240,234,248,0.35)',
  success:{ text:'#4ade80', bg:'rgba(74,222,128,0.10)', border:'rgba(74,222,128,0.2)' },
  warning:{ text:'#fbbf24', bg:'rgba(251,191,36,0.10)', border:'rgba(251,191,36,0.2)' },
  danger: { text:'#f87171', bg:'rgba(248,113,113,0.10)', border:'rgba(248,113,113,0.2)' },
  meshBg: 'radial-gradient(ellipse at 20% 50%,rgba(123,94,167,0.15) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(201,107,154,0.12) 0%,transparent 60%),radial-gradient(ellipse at 60% 80%,rgba(74,111,212,0.10) 0%,transparent 60%)',
  shellBg:'#050408',
  headerBg:'rgba(13,10,24,0.92)',
  navBg:  'rgba(10,8,18,0.96)',
  inputBg:'rgba(255,255,255,0.04)',
  inputFocusBg:'rgba(155,127,212,0.08)',
  sh:{
    xs:'0 1px 4px rgba(0,0,0,.4)',
    sm:'0 2px 12px rgba(0,0,0,.5)',
    md:'0 4px 24px rgba(0,0,0,.6)',
    lg:'0 8px 40px rgba(0,0,0,.7)',
    card:'0 4px 24px rgba(0,0,0,.5),0 1px 0 rgba(255,255,255,.06)',
    rose:'0 8px 28px rgba(201,107,154,.25)',
    violet:'0 8px 28px rgba(123,94,167,.3)',
    brand:'0 6px 24px rgba(123,94,167,.4)',
    gold:'0 6px 24px rgba(212,175,111,.22)',
    inner:'inset 0 1px 0 rgba(255,255,255,.06)',
    glow:'0 0 60px rgba(155,127,212,.12)',
  },
};

// ── Shared (same in both modes) ──────────────────────────────────
export const SHARED = {
  rose:   { d:'#C96B9A', l:'#E8A0BF', dk:'#A0566A' },
  violet: { d:'#7B5EA7', l:'#A08CC8', dk:'#5A3F86' },
  blue:   { d:'#4A6FD4', l:'#7A9CE8', dk:'#2E4FA8' },
  gold:   { d:'#D4AF6F', l:'#E8CC8A', dk:'#B8922A' },
  grad:{
    brand:  'linear-gradient(135deg,#4A6FD4 0%,#7B5EA7 40%,#C96B9A 100%)',
    brandV: 'linear-gradient(180deg,#4A6FD4 0%,#7B5EA7 50%,#C96B9A 100%)',
    dark1:  'linear-gradient(160deg,#1a0f35 0%,#3d2070 50%,#7B5EA7 100%)',
    dark2:  'linear-gradient(160deg,#0f1a35 0%,#1f3575 50%,#4A6FD4 100%)',
    dark3:  'linear-gradient(160deg,#35102a 0%,#7a2a55 50%,#C96B9A 100%)',
    gold:   'linear-gradient(135deg,#B8922A 0%,#D4AF6F 50%,#E8CC8A 100%)',
    rose:   'linear-gradient(135deg,#C96B9A,#7B5EA7)',
    violet: 'linear-gradient(135deg,#7B5EA7,#4A6FD4)',
    card:   'linear-gradient(135deg,rgba(123,94,167,0.06) 0%,rgba(201,107,154,0.04) 100%)',
    soft:   'linear-gradient(135deg,#f3eff9 0%,#fdf0f6 50%,#eef2fc 100%)',
  },
  fontDisplay:"'Playfair Display',Georgia,serif",
  fontBody:   "'Jost',system-ui,sans-serif",
  r:{ xs:6, sm:10, md:14, lg:18, xl:24, xxl:32, pill:999 },
  sp:{ xs:4, sm:8, md:12, lg:16, xl:20, xxl:28, page:20 },
};

// ── T — the live theme object, mutated by ThemeContext ───────────
// Default = dark. ThemeProvider swaps palette in place.
export let T = buildTheme('dark');

export function buildTheme(mode) {
  const pal = mode === 'light' ? LIGHT : DARK;
  return {
    ...SHARED,
    ...pal,
    // Convenience aliases so existing code using T.rose.pale etc still works
    rose:   { ...SHARED.rose,   pale: mode==='light'?'#fdf0f6':'rgba(201,107,154,0.12)', muted: mode==='light'?'#f5d6e8':'rgba(201,107,154,0.25)' },
    violet: { ...SHARED.violet, pale: mode==='light'?'#f3eff9':'rgba(123,94,167,0.12)',  muted: mode==='light'?'#d8ccef':'rgba(123,94,167,0.25)'  },
    blue:   { ...SHARED.blue,   pale: mode==='light'?'#eef2fc':'rgba(74,111,212,0.12)',   muted: mode==='light'?'#c2d0f5':'rgba(74,111,212,0.25)'   },
    gold:   { ...SHARED.gold,   pale: mode==='light'?'rgba(212,175,111,0.12)':'rgba(212,175,111,0.10)', muted: mode==='light'?'rgba(212,175,111,0.25)':'rgba(212,175,111,0.22)' },
    // grad re-add for card & mesh variants
    grad: {
      ...SHARED.grad,
      mesh:   pal.meshBg,
    },
    // shadow shorthand
    sh: pal.sh,
    // mode flag
    isDark: mode === 'dark',
    mode,
  };
}

export function inputBase(focused=false, t=T) {
  return {
    width:'100%', padding:'13px 16px',
    border:`1.5px solid ${focused ? t.violet.d : t.border}`,
    borderRadius:t.r.md, fontSize:15, fontFamily:t.fontBody,
    background: focused ? t.inputFocusBg : t.inputBg,
    color: t.text, outline:'none',
    transition:'all .2s cubic-bezier(.4,0,.2,1)',
    boxShadow: focused ? `0 0 0 3px ${t.isDark?'rgba(155,127,212,0.15)':'rgba(123,94,167,0.12)'},${t.sh.sm}` : t.sh.inner,
    WebkitTextFillColor: t.text,
  };
}

export function primaryBtnStyle(disabled=false) {
  return {
    width:'100%', padding:'14px 20px',
    background: disabled ? (T.isDark?'rgba(255,255,255,0.06)':T.bg2) : T.grad.brand,
    color: disabled ? T.muted : '#fff',
    border:'none', borderRadius:T.r.md, fontSize:15,
    fontFamily:T.fontBody, fontWeight:600, cursor: disabled?'not-allowed':'pointer',
    letterSpacing:'.02em', transition:'all .2s cubic-bezier(.4,0,.2,1)',
    boxShadow: disabled ? 'none' : T.sh.brand, opacity: disabled ? .5 : 1,
  };
}
