import React, { useEffect, useState } from 'react';
import { T } from '../../styles/theme';

export default function SplashScreen() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setP(1), 350);
    const t2 = setTimeout(() => setP(2), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(230deg, rgb(74 111 212 / 18%) 0%, rgb(123 94 167 / 0%) 40%, rgb(201 107 154 / 35%) 100%);', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '8%', left: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,111,212,.25) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '8%', right: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,107,154,.2) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ opacity: p >= 0 ? 1 : 0, transform: p >= 0 ? 'scale(1)' : 'scale(.7)', transition: 'all .6s cubic-bezier(.34,1.56,.64,1)', marginBottom: 32 }}>
        <div style={{ width: 120, height: 120, borderRadius: 36, overflow: 'hidden', background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,.15)', boxShadow: '0 20px 60px rgba(123,94,167,.45),0 0 0 1px rgba(255,255,255,.05)' }}>
          <img src={process.env.PUBLIC_URL + '/logo.JPG'} alt="Sri Fashion Fusion" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        </div>
      </div>

      {/* Name */}
      <div style={{ opacity: p >= 1 ? 1 : 0, transform: p >= 1 ? 'translateY(0)' : 'translateY(12px)', transition: 'all .5s cubic-bezier(.4,0,.2,1) .1s', textAlign: 'center', marginBottom: 10 }}>
        {/* <div style={{ fontFamily:T.fontDisplay, fontSize:32, fontWeight:700, color:'#fff', letterSpacing:'-.02em', lineHeight:1.1 }}>Sri Fashion</div> */}
        <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontStyle: 'italic', fontWeight: 400, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 2 }}>Sri Fashion Fusion</div>
      </div>

      {/* Tagline */}
      <div style={{ opacity: p >= 2 ? 1 : 0, transform: p >= 2 ? 'translateY(0)' : 'translateY(8px)', transition: 'all .5s cubic-bezier(.4,0,.2,1) .15s', textAlign: 'center', marginBottom: 64 }}>
        {/* <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', letterSpacing:'.18em', textTransform:'uppercase', fontFamily:T.fontBody }}>Premium Tailoring Management</div> */}
        {/* <svg width="60" height="10" viewBox="0 0 60 10" fill="none">
          <path
            d="M0 5 Q15 1 30 5 Q45 9 60 5"
            stroke="rgba(201,107,154,0.4)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <p className="text-xs text-[var(--color-text-muted)] italic font-display" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', color: 'rgb(26 22 37 / 45%)', fontSize: '0.75rem' }}>
          Made with ♥ &amp; thread
        </p> */}
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 60, display: 'flex', gap: 8, opacity: p >= 2 ? 1 : 0, transition: 'opacity .4s .3s' }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: `rgba(255,255,255,${.25 + i * .2})`, animation: `pulse 1.4s ease-in-out ${i * .22}s infinite` }} />)}
      </div>
    </div>
  );
}
