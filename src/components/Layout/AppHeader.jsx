import React, { useState } from 'react';
import { logOut } from '../../firebase/authService';
import { useTheme } from '../../context/ThemeContext';
import { Logo, Avatar } from '../shared';

export default function AppHeader({ user }) {
  const [menu, setMenu] = useState(false);
  const { theme: T, toggle, isDark } = useTheme();
  const isIPhone = /iPhone/i.test(navigator.userAgent);

  const phone = user?.phoneNumber?.replace('+91', '').replace(/(\d{5})(\d{5})/, '$1 $2') || 'User';

  return (
    <div id="sff-app-header" style={{
      background: T.headerBg, backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
      padding: '12px 20px 11px', borderBottom: `1px solid ${T.border}`,
      position: 'fixed', zIndex: 40, fontFamily: T.fontBody, transition: 'background .3s, border-color .3s',
      width: '100%', paddingTop: isIPhone ? '58px' : 12,
    }}>
      <div id="sff-header-accent" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(123,94,167,0.5),rgba(201,107,154,0.5),transparent)', pointerEvents: 'none'
      }} />

      <div id="sff-header-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div id="sff-header-logo"><Logo size={38} showText textSize={14} /></div>
        <div style={{ flex: 1 }} />

        {/* Theme toggle */}
        <button id="sff-theme-toggle" onClick={toggle} title={isDark ? 'Switch to Light' : 'Switch to Dark'} style={{
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: `1px solid ${T.border}`,
          borderRadius: T.r.pill, padding: '5px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .25s', fontFamily: T.fontBody,
        }}>
          <span style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.text2, letterSpacing: '.04em' }}>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* Live badge */}
        <div id="sff-header-live-badge" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: T.r.pill, background: T.success.bg, border: `1px solid ${T.success.border}` }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success.text, boxShadow: isDark ? '0 0 6px rgba(74,222,128,.6)' : 'none', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: T.success.text, letterSpacing: '.05em' }}>Live</span>
        </div>

        {/* Avatar menu */}
        <div id="sff-header-avatar-wrap" style={{ position: 'relative' }}>
          <button id="sff-header-avatar-btn" onClick={() => setMenu(s => !s)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
            <Avatar name={phone} size={36} />
          </button>
          {menu && (
            <>
              <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
              <div id="sff-header-menu" style={{
                position: 'absolute', right: 0, top: 46,
                background: isDark ? 'rgba(22,18,42,0.98)' : 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(24px)', border: `1px solid ${T.border}`,
                borderRadius: T.r.lg, padding: 10, zIndex: 50, minWidth: 196, boxShadow: T.sh.lg,
              }}>
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: T.grad.brand, opacity: .5 }} />
                <div id="sff-header-menu-user" style={{ padding: '8px 10px 12px', borderBottom: `1px solid ${T.border}`, marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Signed in as</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>+91 {phone}</div>
                </div>
                <button id="sff-header-signout-btn"
                  onClick={async () => { if (window.confirm('Sign out?')) await logOut(); setMenu(false); }}
                  style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, fontWeight: 600, color: T.danger.text, cursor: 'pointer', fontFamily: T.fontBody, borderRadius: T.r.sm, transition: 'background .15s' }}
                  onMouseEnter={e => e.target.style.background = T.danger.bg}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >🚪 Sign out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
