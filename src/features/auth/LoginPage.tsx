import { useState, useRef, useEffect } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { sendPhoneOtp, signInAdmin } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';

const RESEND_SECONDS = 30;

export default function LoginPage() {
  const { T } = useAppTheme();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [tab,      setTab]      = useState<'phone' | 'admin'>('phone');
  const [phone,    setPhone]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [otpSent,  setOtpSent]  = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [focused,  setFocused]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

  if (user) {
    if (user.role === 'superAdmin') navigate('/admin', { replace: true });
    else navigate('/dashboard', { replace: true });
  }

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const handleSendOtp = async () => {
    const formatted = `+91${phone.trim()}`;
    if (!/^\+91\d{10}$/.test(formatted)) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true); setError('');
    try {
      confirmationRef.current = await sendPhoneOtp(formatted, 'recaptcha-container');
      setOtpSent(true);
      setResendIn(RESEND_SECONDS);
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      await confirmationRef.current!.confirm(otp);
      // navigation handled by auth state listener
    } catch {
      setError('Incorrect code. Try again.');
    } finally { setLoading(false); }
  };

  const handleAdminLogin = async () => {
    if (!email || !password) { setError('Enter email and password'); return; }
    setLoading(true); setError('');
    try {
      await signInAdmin(email, password);
      navigate('/admin', { replace: true });
    } catch {
      setError('Incorrect email or password.');
    } finally { setLoading(false); }
  };

  function switchTab(t: 'phone' | 'admin') {
    setTab(t); setError(''); setOtpSent(false); setOtp('');
  }

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

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%', padding: '15px 0',
    background: disabled ? (T.isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand,
    color: disabled ? T.muted : '#fff',
    border: 'none', borderRadius: T.r.md,
    fontSize: 15, fontWeight: 700, letterSpacing: '.02em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: T.fontBody,
    boxShadow: disabled ? 'none' : T.sh.brand,
    transition: 'all .2s',
    opacity: disabled ? .7 : 1,
  });

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
      <div id="recaptcha-container" />

      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* ── Brand ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 46, fontFamily: T.fontDisplay, fontWeight: 700, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, letterSpacing: '-.02em' }}>
            Boutique
          </div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: '.18em', textTransform: 'uppercase', marginTop: 6 }}>
            Ecosystem
          </div>
        </div>

        {/* ── Tab pills ── */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: T.isDark ? 'rgba(255,255,255,0.05)' : T.bg2, borderRadius: T.r.lg, padding: 4 }}>
          {(['phone', 'admin'] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                borderRadius: T.r.md, fontFamily: T.fontBody,
                fontSize: 14, fontWeight: tab === t ? 700 : 500,
                background: tab === t ? (T.isDark ? T.card : '#fff') : 'transparent',
                color: tab === t ? T.text : T.muted,
                boxShadow: tab === t ? T.sh.xs : 'none',
                transition: 'all .2s',
              }}
            >
              {t === 'phone' ? '📱  Phone Login' : '🔒  Admin Login'}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: T.danger.bg, border: `1px solid ${T.danger.border}`, borderRadius: T.r.md, padding: '11px 14px', marginBottom: 16, fontSize: 13, color: T.danger.text }}>
            {error}
          </div>
        )}

        {/* ── Phone tab ── */}
        {tab === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Country code + phone */}
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
                disabled={otpSent}
                onKeyDown={(e) => !otpSent && e.key === 'Enter' && handleSendOtp()}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused('')}
                style={{ ...inp('phone'), opacity: otpSent ? .55 : 1 }}
              />
            </div>

            {/* OTP boxes (shown after send) */}
            {otpSent && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: T.muted }}>Code sent to +91 {phone}</span>
                  {resendIn > 0
                    ? <span style={{ fontSize: 12, color: T.muted }}>Resend in {resendIn}s</span>
                    : <button onClick={handleSendOtp} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: T.violet.d, fontFamily: T.fontBody, padding: 0 }}>Resend</button>
                  }
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  {Array.from({ length: 6 }).map((_, i) => {
                    const isFoc = focused === `otp-${i}`;
                    const filled = !!otp[i];
                    return (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        autoFocus={i === 0}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i] || ''}
                        onChange={(e) => {
                          const digit = e.target.value.replace(/\D/g, '').slice(-1);
                          const next = otp.split('');
                          next[i] = digit;
                          const updated = next.join('').slice(0, 6);
                          setOtp(updated);
                          if (digit && i < 5) otpRefs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace') {
                            if (otp[i]) {
                              const next = otp.split('');
                              next[i] = '';
                              setOtp(next.join(''));
                            } else if (i > 0) {
                              otpRefs.current[i - 1]?.focus();
                            }
                          }
                          if (e.key === 'Enter' && otp.length === 6) handleVerifyOtp();
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                          if (pasted) {
                            setOtp(pasted);
                            otpRefs.current[Math.min(pasted.length, 5)]?.focus();
                          }
                          e.preventDefault();
                        }}
                        onFocus={() => setFocused(`otp-${i}`)}
                        onBlur={() => setFocused('')}
                        style={{
                          width: 46, height: 54,
                          textAlign: 'center',
                          fontSize: 22, fontWeight: 700,
                          fontFamily: T.fontBody,
                          color: filled ? T.violet.d : T.text,
                          background: isFoc ? T.inputFocusBg : T.inputBg,
                          border: `1.5px solid ${isFoc ? T.violet.d : filled ? `${T.violet.d}66` : T.border}`,
                          borderRadius: T.r.md,
                          outline: 'none',
                          boxShadow: isFoc ? `0 0 0 3px ${T.isDark ? 'rgba(155,127,212,0.18)' : 'rgba(123,94,167,0.12)'}` : 'none',
                          transition: 'border-color .18s, box-shadow .18s, background .18s',
                          caretColor: 'transparent',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={otpSent ? handleVerifyOtp : handleSendOtp}
              disabled={loading || (otpSent && otp.length < 6)}
              style={{ ...btnStyle(loading || (otpSent && otp.length < 6)), marginTop: 4 }}
            >
              {loading ? 'Please wait…' : otpSent ? 'Verify & Sign In' : 'Send OTP'}
            </button>

            {otpSent && (
              <button
                onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.muted, fontFamily: T.fontBody, padding: '2px 0', textAlign: 'center' }}
              >
                ← Change number
              </button>
            )}
          </div>
        )}

        {/* ── Admin tab ── */}
        {tab === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              style={inp('email')}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                style={{
                  ...inp('password'),
                  paddingRight: 44,
                  fontSize: 15,
                  letterSpacing: !showPwd && password ? '0.15em' : 'normal',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.muted, padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPwd ? (
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
                )}
              </button>
            </div>
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              style={{ ...btnStyle(loading), marginTop: 4 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: T.muted, letterSpacing: '.05em' }}>
          Boutique Ecosystem · v1.0
        </div>

      </div>
    </div>
  );
}
