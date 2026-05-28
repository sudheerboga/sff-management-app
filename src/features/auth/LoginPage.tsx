import { useState } from 'react';
import { signInWithPhone } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

function friendlyError(code: string): string {
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Incorrect password.';
  if (code.includes('user-not-found')) return 'Phone number not registered.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Try again later.';
  return 'Sign in failed. Please try again.';
}

export default function LoginPage() {
  const { T } = useAppTheme();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [phone,   setPhone]   = useState('');
  const [pwd,     setPwd]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  if (user) {
    if (user.role === 'superAdmin') navigate('/admin', { replace: true });
    else navigate('/dashboard', { replace: true });
  }

  const handleLogin = async () => {
    if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
    if (!pwd) { setError('Enter your password'); return; }
    setLoading(true); setError('');
    try {
      await signInWithPhone(phone, pwd);
      // stay in loading state — auth listener will navigate away
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? '';
      setError(friendlyError(code));
      setLoading(false);
    }
  };

  function inp(id: string): React.CSSProperties {
    const f = focused === id;
    return {
      width: '100%', padding: '14px 16px',
      border: `1.5px solid ${f ? T.violet.d : T.border}`,
      borderRadius: T.r.md, fontSize: 15,
      fontFamily: T.fontBody,
      background: f ? T.inputFocusBg : T.inputBg,
      color: T.text, outline: 'none',
      boxSizing: 'border-box' as const,
      transition: 'border-color .2s, background .2s, box-shadow .2s',
      boxShadow: f ? `0 0 0 3px ${T.isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.10)'}` : 'none',
      WebkitTextFillColor: T.text,
    };
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.fontBody, padding: '24px 20px' }}>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px ${T.inputBg} inset !important;
          -webkit-text-fill-color: ${T.text} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        @keyframes needleBob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes stitchPop {
          0%, 60%, 100% { opacity: 0.25; transform: scaleX(0.5); }
          30%            { opacity: 1;    transform: scaleX(1); }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 46, fontFamily: T.fontDisplay, fontWeight: 700, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, letterSpacing: '-.02em' }}>
            Boutiqo
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: T.danger.bg, border: `1px solid ${T.danger.border}`, borderRadius: T.r.md, padding: '11px 14px', marginBottom: 16, fontSize: 13, color: T.danger.text }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', border: `1.5px solid ${T.border}`, borderRadius: T.r.md, background: T.inputBg, fontSize: 14, fontWeight: 600, color: T.text2, whiteSpace: 'nowrap', flexShrink: 0, gap: 6 }}>
              🇮🇳 <span>+91</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Phone number"
              onKeyDown={(e) => e.key === 'Enter' && document.getElementById('pwd-input')?.focus()}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused('')}
              style={inp('phone')}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              id="pwd-input"
              type={showPwd ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              onFocus={() => setFocused('pwd')}
              onBlur={() => setFocused('')}
              style={{
                ...inp('pwd'),
                paddingRight: 44,
                letterSpacing: !showPwd && pwd ? '0.15em' : 'normal',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <EyeIcon open={showPwd} />
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', height: 52, marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              background: loading ? (T.isDark ? '#c5c5c53d' : '#c5c5c53d') : T.grad.brand,
              color: loading ? 'rgb(123, 94, 167)' : '#fff',
              border: 'none', borderRadius: T.r.md,
              fontSize: 15, fontWeight: 700, letterSpacing: '.02em',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: T.fontBody,
              boxShadow: loading ? 'none' : T.sh.brand,
              transition: 'background .2s, box-shadow .2s, color .2s',
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {/* bobbing needle */}
                <svg width="12" height="15" viewBox="0 0 12 22" fill="none"
                  style={{ animation: 'needleBob 0.65s ease-in-out infinite', flexShrink: 0 }}>
                  <path d="M6 0.5 C7.4 0.5 8.5 1.7 8.5 3.3 L7.2 16.5 L6 21.5 L4.8 16.5 L3.5 3.3 C3.5 1.7 4.6 0.5 6 0.5Z" fill={'rgb(123, 94, 167)'} />
                  <ellipse cx="6" cy="4.2" rx="2.1" ry="1.4" fill="none" stroke={'rgb(123, 94, 167)'} strokeWidth="1.3" opacity="0.5"/>
                </svg>
                <span>Signing in</span>
                {/* running-stitch dashes */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={{
                      display: 'inline-block', width: 7, height: 2,
                      background: 'rgb(123, 94, 167)', borderRadius: 2,
                      animation: `stitchPop 1.1s ease-in-out ${i * 0.18}s infinite`,
                    }} />
                  ))}
                </span>
              </span>
            ) : 'Sign In'}
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: T.muted, letterSpacing: '.05em' }}>
          Boutiqo · v1.0
        </div>

      </div>
    </div>
  );
}
