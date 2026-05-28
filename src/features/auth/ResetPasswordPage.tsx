import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { changePassword, clearMustResetPassword } from '@/services/auth';
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

export default function ResetPasswordPage() {
  const { T } = useAppTheme();
  const navigate = useNavigate();
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [focused,    setFocused]    = useState('');
  const [showNew,    setShowNew]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return; }
    if (!user.mustResetPassword) { navigate('/dashboard', { replace: true }); }
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (newPwd.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPwd !== confirmPwd) { setError('Passwords do not match'); return; }
    if (!user) return;
    setLoading(true); setError('');
    try {
      await changePassword(newPwd);
      await clearMustResetPassword(user.uid);
      setUser({ ...user, mustResetPassword: false });
      navigate('/dashboard', { replace: true });
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to update password. Please try again.');
    } finally { setLoading(false); }
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
      paddingRight: 44,
      transition: 'border-color .2s, background .2s, box-shadow .2s',
      boxShadow: f ? `0 0 0 3px ${T.isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.10)'}` : 'none',
      WebkitTextFillColor: T.text,
    };
  }

  const btnDisabled = loading || newPwd.length < 6 || newPwd !== confirmPwd;

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
      `}</style>

      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 46, fontFamily: T.fontDisplay, fontWeight: 700, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, letterSpacing: '-.02em' }}>
            Boutiqo
          </div>
        </div>

        {/* Card */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.r.lg, padding: '28px 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>
              Set your password
            </div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
              Welcome! Your account was set up with a temporary password. Please create a new password to continue.
            </div>
          </div>

          {error && (
            <div style={{ background: T.danger.bg, border: `1px solid ${T.danger.border}`, borderRadius: T.r.md, padding: '11px 14px', marginBottom: 16, fontSize: 13, color: T.danger.text }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="New password (min 6 characters)"
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('confirm-pwd')?.focus()}
                onFocus={() => setFocused('new')}
                onBlur={() => setFocused('')}
                style={{ ...inp('new'), letterSpacing: !showNew && newPwd ? '0.15em' : 'normal' }}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <EyeIcon open={showNew} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="confirm-pwd"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Confirm new password"
                onKeyDown={(e) => e.key === 'Enter' && !btnDisabled && handleSubmit()}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused('')}
                style={{ ...inp('confirm'), letterSpacing: !showConfirm && confirmPwd ? '0.15em' : 'normal' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={btnDisabled}
              style={{
                width: '100%', padding: '15px 0', marginTop: 4,
                background: btnDisabled ? (T.isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand,
                color: btnDisabled ? T.muted : '#fff',
                border: 'none', borderRadius: T.r.md,
                fontSize: 15, fontWeight: 700, letterSpacing: '.02em',
                cursor: btnDisabled ? 'not-allowed' : 'pointer',
                fontFamily: T.fontBody,
                boxShadow: btnDisabled ? 'none' : T.sh.brand,
                transition: 'all .2s', opacity: btnDisabled ? .7 : 1,
              }}
            >
              {loading ? 'Saving…' : 'Set Password & Continue'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: T.muted, letterSpacing: '.05em' }}>
          Boutiqo · v1.0
        </div>
      </div>
    </div>
  );
}
