import { useEffect, useState } from 'react';

const VIOLET = '#7B5EA7';
const ROSE   = '#7B5EA7';
const BLUE   = '#7B5EA7';
const BG     = '#fdfaf7';
const FONT_BODY    = "'Jost', system-ui, sans-serif";
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

export default function LoadingScreen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes be-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes be-pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes be-orb1  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(14px,-18px)} }
        @keyframes be-orb2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,14px)} }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0,
        background: BG,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, overflow: 'hidden',
      }}>

        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '9%', left: '7%',
          width: 300, height: 300, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(123,94,167,0.12) 0%, transparent 70%)`,
          animation: 'be-orb1 9s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '11%', right: '5%',
          width: 240, height: 240, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(201,107,154,0.10) 0%, transparent 70%)`,
          animation: 'be-orb2 11s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '12%',
          width: 160, height: 160, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(74,111,212,0.08) 0%, transparent 70%)`,
          animation: 'be-orb1 13s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />

        {/* Decorative rings */}
        <div style={{
          position: 'absolute', width: 260, height: 260, borderRadius: '50%',
          border: `1px solid rgba(123,94,167,0.1)`,
          opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.9s',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: '50%',
          border: `1px solid rgba(201,107,154,0.07)`,
          opacity: phase >= 1 ? 1 : 0, transition: 'opacity 1.1s 0.25s',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          marginBottom: 28, position: 'relative', zIndex: 2,
          animation: phase >= 1 ? 'be-float 4s ease-in-out infinite' : 'none',
        }}>
          {/* Glow halo */}
          <div style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(123,94,167,0.18) 0%, transparent 70%)`,
            filter: 'blur(12px)', zIndex: -1,
          }} />
          {/* Icon box */}
          <div style={{
            width: 100, height: 100, borderRadius: 26,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${VIOLET} 40%, ${ROSE} 100%)`,
            border: `1.5px solid rgba(123,94,167,0.15)`,
            boxShadow: '0 20px 56px rgba(123,94,167,0.18), 0 4px 12px rgba(123,94,167,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, color: '#fff' }}>B</span>
          </div>
        </div>

        {/* App name */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(14px)',
          transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1) 0.1s',
          textAlign: 'center', marginBottom: 8,
          position: 'relative', zIndex: 2,
        }}>
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 24, fontWeight: 700,
            letterSpacing: '-0.02em',
            background: `linear-gradient(125deg, ${VIOLET} 0%, ${ROSE} 55%, ${BLUE} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Boutiqo
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.5s 0.15s',
          textAlign: 'center', marginBottom: 64,
          position: 'relative', zIndex: 2,
        }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: 8,
            color: `rgba(123,94,167,0.55)`,
            letterSpacing: '0.22em',
            textTransform: 'uppercase', fontWeight: 600,
          }}>
            Premium Boutique Management
          </div>
          <div style={{
            width: 38, height: 1,
            background: `linear-gradient(90deg, ${VIOLET}, ${ROSE})`,
            margin: '10px auto 0', borderRadius: 1, opacity: 0.45,
          }} />
        </div>

        {/* Loading dots */}
        <div style={{
          position: 'absolute', bottom: 52,
          display: 'flex', gap: 8,
          opacity: phase >= 3 ? 1 : 0,
          transition: 'opacity 0.4s 0.3s',
          zIndex: 2,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === 1 ? ROSE : VIOLET,
              animation: `be-pulse 1.4s ease-in-out ${i * 0.22}s infinite`,
            }} />
          ))}
        </div>

        {/* Version */}
        <div style={{
          position: 'absolute', bottom: 24,
          fontFamily: FONT_BODY, fontSize: 10,
          color: `rgba(123,94,167,0.35)`,
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          v1.0.0
        </div>
      </div>
    </>
  );
}
