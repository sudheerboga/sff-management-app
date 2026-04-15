// Sri Fashion Fusion — Brand Theme v5
// Derived from uploaded theme.ts

export const T = {
  // Brand palette
  rose:   { d:'#C96B9A', l:'#E8A0BF', dk:'#A0566A', pale:'#fdf0f6', muted:'#f5d6e8' },
  violet: { d:'#7B5EA7', l:'#A08CC8', dk:'#5A3F86', pale:'#f3eff9', muted:'#d8ccef' },
  blue:   { d:'#4A6FD4', l:'#7A9CE8', dk:'#2E4FA8', pale:'#eef2fc', muted:'#c2d0f5' },

  // Surfaces (light mode)
  bg:    '#f9f5f0',
  bg2:   '#f0ebe4',
  card:  '#ffffff',
  border:'rgba(0,0,0,0.08)',
  text:  '#1a1625',
  text2: '#5a5468',
  muted: 'rgba(26,22,37,0.45)',

  // Semantic
  success:{ text:'#1e6b3e', bg:'#e8f5ee', border:'rgba(30,107,62,0.18)' },
  warning:{ text:'#7a4f00', bg:'#fff3dc', border:'rgba(122,79,0,0.18)' },
  danger: { text:'#8b2020', bg:'#fdeaea', border:'rgba(139,32,32,0.18)' },

  // Gradients (from theme.ts)
  grad:{
    brand:  'linear-gradient(135deg,#4A6FD4 0%,#7B5EA7 40%,#C96B9A 100%)',
    brandV: 'linear-gradient(180deg,#4A6FD4 0%,#7B5EA7 50%,#C96B9A 100%)',
    dark1:  'linear-gradient(160deg,#1a0f35 0%,#3d2070 50%,#7B5EA7 100%)',
    dark3:  'linear-gradient(160deg,#35102a 0%,#7a2a55 50%,#C96B9A 100%)',
    soft:   'linear-gradient(135deg,#f3eff9 0%,#fdf0f6 50%,#eef2fc 100%)',
    card:   'linear-gradient(135deg,rgba(74,111,212,.04) 0%,rgba(123,94,167,.06) 50%,rgba(201,107,154,.04) 100%)',
    rose:   'linear-gradient(135deg,#C96B9A,#7B5EA7)',
    violet: 'linear-gradient(135deg,#7B5EA7,#4A6FD4)',
  },

  // Fonts
  fontDisplay:"'Playfair Display',Georgia,serif",
  fontBody:   "'Jost',system-ui,sans-serif",

  // iOS-feel radii
  r:{ xs:6, sm:10, md:14, lg:18, xl:24, xxl:32, pill:999 },

  // Shadows
  sh:{
    xs:'0 1px 4px rgba(26,22,37,.06)',
    sm:'0 2px 10px rgba(26,22,37,.08)',
    md:'0 4px 20px rgba(26,22,37,.10)',
    lg:'0 8px 32px rgba(26,22,37,.12)',
    card:'0 2px 16px rgba(26,22,37,.07)',
    rose:'0 8px 28px rgba(201,107,154,.22)',
    violet:'0 8px 28px rgba(123,94,167,.22)',
    brand:'0 6px 20px rgba(123,94,167,.28)',
    inner:'inset 0 1px 3px rgba(26,22,37,.06)',
  },

  sp:{ xs:4, sm:8, md:12, lg:16, xl:20, xxl:28, page:20 },
};

export const inputBase = (focused=false) => ({
  width:'100%', padding:'13px 16px',
  border:`1.5px solid ${focused ? T.violet.d : T.border}`,
  borderRadius:T.r.md, fontSize:15, fontFamily:T.fontBody,
  background: focused ? '#fff' : T.bg, color:T.text, outline:'none',
  transition:'all .2s cubic-bezier(.4,0,.2,1)',
  boxShadow: focused ? `0 0 0 4px ${T.violet.pale},${T.sh.sm}` : T.sh.inner,
});

export const primaryBtnStyle = (disabled=false) => ({
  width:'100%', padding:'14px 20px',
  background: disabled ? T.bg2 : T.grad.brand,
  color: disabled ? T.muted : '#fff',
  border:'none', borderRadius:T.r.md, fontSize:15,
  fontFamily:T.fontBody, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
  letterSpacing:'.02em', transition:'all .2s cubic-bezier(.4,0,.2,1)',
  boxShadow: disabled ? 'none' : T.sh.brand, opacity: disabled ? .6 : 1,
});
