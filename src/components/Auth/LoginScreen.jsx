import React, { useState, useRef, useEffect } from 'react';
import { setupRecaptcha, sendOtp, verifyOtp } from '../../firebase/authService';
import { T, primaryBtnStyle } from '../../styles/theme';
import { PrimaryButton } from '../shared';

export default function LoginScreen() {
  const [step,setStep]       = useState('phone');
  const [phone,setPhone]     = useState('');
  const [otp,setOtp]         = useState(['','','','','','']);
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState('');
  const [conf,setConf]       = useState(null);
  const [timer,setTimer]     = useState(0);
  const refs = useRef([]);
  const timerRef = useRef(null);
  useEffect(()=>{ if(timer>0) timerRef.current=setTimeout(()=>setTimer(t=>t-1),1000); return()=>clearTimeout(timerRef.current); },[timer]);

  const digits = phone.replace(/\D/g,'');
  const otpFull = otp.join('');

  async function handleSend() {
    setError(''); if(digits.length!==10){setError('Enter a valid 10-digit mobile number');return;}
    setLoading(true);
    try { setupRecaptcha('rc'); const r=await sendOtp(`+91${digits}`); setConf(r); setStep('otp'); setTimer(30); }
    catch(e){ setError('Could not send OTP. Please try again.'); }
    finally{ setLoading(false); }
  }

  async function handleVerify() {
    setError(''); if(otpFull.length!==6){setError('Enter the complete 6-digit OTP');return;}
    setLoading(true);
    try{ await verifyOtp(conf,otpFull); }
    catch(e){ setError('Incorrect OTP. Try again.'); setOtp(['','','','','','']); refs.current[0]?.focus(); }
    finally{ setLoading(false); }
  }

  function handleOtpChange(i,val) {
    if(!/^\d*$/.test(val)) return;
    const next=[...otp]; next[i]=val.slice(-1); setOtp(next);
    if(val&&i<5) refs.current[i+1]?.focus();
  }

  return (
    <div style={{ minHeight:'100vh', background:T.grad.soft, fontFamily:T.fontBody, position:'relative', overflow:'hidden' }}>
      {/* BG blobs */}
      <div style={{ position:'fixed', top:-120, right:-80, width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle,rgba(123,94,167,.12) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:-80, left:-60, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,107,154,.10) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* Hero */}
      <div style={{ width:'100%', background:T.grad.dark1, borderRadius:`0 0 ${T.r.xxl}px ${T.r.xxl}px`, padding:'64px 32px 52px', textAlign:'center', position:'relative', overflow:'hidden', zIndex:1 }}>
        <div style={{ position:'absolute', top:'35%', left:'50%', transform:'translate(-50%,-50%)', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(123,94,167,.35) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div className="fade-up" style={{ position:'relative', zIndex:2 }}>
          <div style={{ width:90, height:90, borderRadius:28, margin:'0 auto 22px', overflow:'hidden', background:'rgba(255,255,255,.1)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(255,255,255,.2)', boxShadow:'0 16px 48px rgba(123,94,167,.5)' }}>
            <img src={process.env.PUBLIC_URL+'/logo.JPG'} alt="Sri Fashion Fusion" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
          </div>
          <div style={{ fontFamily:T.fontDisplay, fontSize:28, fontWeight:700, color:'#fff', letterSpacing:'-.02em', lineHeight:1.1 }}>Sri Fashion Fusion</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginTop:6, letterSpacing:'.14em', textTransform:'uppercase' }}>Premium Tailoring Management</div>
        </div>
      </div>

      {/* Card */}
      <div className="fade-up" style={{ margin:'-26px 16px 0', background:'rgba(255,255,255,.94)', backdropFilter:'blur(24px)', borderRadius:T.r.xl, padding:'30px 24px 34px', border:`1px solid ${T.border}`, boxShadow:`0 -4px 0 0 ${T.violet.d},${T.sh.lg}`, position:'relative', zIndex:2 }}>

        {step==='phone' ? (
          <>
            <div style={{ marginBottom:26 }}>
              <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, marginBottom:6 }}>Welcome back</div>
              <div style={{ fontSize:14, color:T.text2, lineHeight:1.6 }}>Enter your mobile number to sign in with OTP</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>Mobile Number</label>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ padding:'13px 14px', borderRadius:T.r.md, fontSize:15, fontWeight:600, color:T.text2, background:T.bg2, border:`1.5px solid ${T.border}`, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>🇮🇳 +91</div>
                <input type="tel" value={phone} autoFocus onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="98765 43210"
                  style={{ flex:1, padding:'13px 16px', border:`1.5px solid ${T.border}`, borderRadius:T.r.md, fontSize:16, letterSpacing:1.5, fontFamily:T.fontBody, background:T.bg, color:T.text, outline:'none' }} />
              </div>
            </div>
            {error&&<div style={{ fontSize:13, color:T.danger.text, background:T.danger.bg, padding:'10px 14px', borderRadius:T.r.md, marginBottom:14, border:`1px solid ${T.danger.border}` }}>{error}</div>}
            <PrimaryButton onClick={handleSend} disabled={digits.length!==10} loading={loading}>Send OTP →</PrimaryButton>
          </>
        ) : (
          <>
            <button onClick={()=>{setStep('phone');setError('');}} style={{ background:'none', border:'none', color:T.violet.d, fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:18, fontFamily:T.fontBody }}>← Change number</button>
            <div style={{ marginBottom:26 }}>
              <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, marginBottom:6 }}>Verify OTP</div>
              <div style={{ fontSize:14, color:T.text2 }}>Sent to <strong style={{ color:T.text }}>+91 {phone}</strong></div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:26 }}>
              {otp.map((d,i)=>(
                <input key={i} ref={el=>refs.current[i]=el} type="tel" maxLength={1} value={d} autoFocus={i===0}
                  onChange={e=>handleOtpChange(i,e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Backspace'&&!d&&i>0) refs.current[i-1]?.focus(); if(e.key==='Enter') handleVerify(); }}
                  style={{ width:46, height:58, textAlign:'center', fontSize:24, fontWeight:700, border:`2px solid ${d?T.violet.d:T.border}`, borderRadius:T.r.md, background:d?T.violet.pale:T.bg, color:d?T.violet.dk:T.text, outline:'none', transition:'all .15s cubic-bezier(.4,0,.2,1)', fontFamily:T.fontBody, boxShadow:d?`0 0 0 4px ${T.violet.pale}`:'none' }} />
              ))}
            </div>
            {error&&<div style={{ fontSize:13, color:T.danger.text, background:T.danger.bg, padding:'10px 14px', borderRadius:T.r.md, marginBottom:14, border:`1px solid ${T.danger.border}` }}>{error}</div>}
            <PrimaryButton onClick={handleVerify} disabled={otpFull.length!==6} loading={loading} style={{ marginBottom:16 }}>Verify & Sign in →</PrimaryButton>
            <div style={{ textAlign:'center' }}>
              {timer>0 ? <span style={{ fontSize:13, color:T.muted }}>Resend in <strong>{timer}s</strong></span>
                : <button onClick={()=>{setStep('phone');setError('');setOtp(['','','','','','']);}} style={{ background:'none', border:'none', color:T.violet.d, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:T.fontBody }}>Resend OTP</button>}
            </div>
          </>
        )}
      </div>

      <div id="rc" />
      <p style={{ textAlign:'center', fontSize:11, color:T.muted, marginTop:24, position:'relative', zIndex:1 }}>Secured by Firebase Authentication</p>
    </div>
  );
}
