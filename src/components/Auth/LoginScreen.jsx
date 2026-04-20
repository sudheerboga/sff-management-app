import React, { useState, useRef, useEffect } from 'react';
import { setupRecaptcha, sendOtp, verifyOtp } from '../../firebase/authService';
import { useTheme } from '../../context/ThemeContext';
import { inputBase } from '../../styles/theme';
import { PrimaryButton } from '../shared';

export default function LoginScreen() {
  const { theme: T, isDark } = useTheme();
  const [step,setStep]=useState('phone'); const [phone,setPhone]=useState('');
  const [otp,setOtp]=useState(['','','','','','']); const [loading,setLoading]=useState(false);
  const [error,setError]=useState(''); const [conf,setConf]=useState(null); const [timer,setTimer]=useState(0);
  const refs=useRef([]); const timerRef=useRef(null);
  useEffect(()=>{ if(timer>0) timerRef.current=setTimeout(()=>setTimer(t=>t-1),1000); return()=>clearTimeout(timerRef.current); },[timer]);
  const digits=phone.replace(/\D/g,''); const otpFull=otp.join('');

  async function handleSend(){
    setError(''); if(digits.length!==10){setError('Enter a valid 10-digit mobile number');return;}
    setLoading(true);
    try{setupRecaptcha('rc');const r=await sendOtp(`+91${digits}`);setConf(r);setStep('otp');setTimer(30);}
    catch(e){setError('Could not send OTP. Please try again.');}
    finally{setLoading(false);}
  }
  async function handleVerify(){
    setError(''); if(otpFull.length!==6){setError('Enter the complete 6-digit OTP');return;}
    setLoading(true);
    try{await verifyOtp(conf,otpFull);}
    catch(e){setError('Incorrect OTP. Try again.');setOtp(['','','','','','']);refs.current[0]?.focus();}
    finally{setLoading(false);}
  }
  function handleOtpChange(i,val){
    if(!/^\d*$/.test(val))return;
    const next=[...otp];next[i]=val.slice(-1);setOtp(next);
    if(val&&i<5)refs.current[i+1]?.focus();
  }

  const heroBg = isDark
    ? 'linear-gradient(160deg,#1a0f35 0%,#2d1260 40%,#3d1a40 100%)'
    : 'linear-gradient(160deg,#7B5EA7 0%,#4A6FD4 50%,#C96B9A 100%)';

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:T.fontBody, position:'relative', overflow:'hidden', transition:'background .3s' }}>
      <div style={{ position:'fixed', inset:0, background:T.grad.mesh, pointerEvents:'none', zIndex:0 }} />

      {/* Hero */}
      <div style={{ width:'100%', position:'relative', overflow:'hidden', zIndex:1, background:heroBg, borderRadius:`0 0 ${T.r.xxl}px ${T.r.xxl}px`, padding:'58px 32px 58px', textAlign:'center' }}>
        <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(155,127,212,.25) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:20, right:20, width:80, height:80, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.12)', pointerEvents:'none' }} />
        <div className="fade-up" style={{ position:'relative', zIndex:2 }}>
          <div style={{ position:'relative', display:'inline-block', marginBottom:22 }}>
            <div style={{ position:'absolute', inset:-14, borderRadius:'50%', background:'radial-gradient(circle,rgba(155,127,212,.3) 0%,transparent 70%)', filter:'blur(8px)' }} />
            <div style={{ width:86, height:86, borderRadius:26, overflow:'hidden', margin:'0 auto', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(255,255,255,0.2)', boxShadow:'0 16px 48px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.15)' }}>
              <img src={process.env.PUBLIC_URL+'/logo.JPG'} alt="Sri Fashion Fusion" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
            </div>
          </div>
          <div style={{ fontFamily:T.fontDisplay, fontSize:26, fontWeight:700, letterSpacing:'-.01em', color:'#fff', marginBottom:6 }}>Sri Fashion Fusion</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', letterSpacing:'.2em', textTransform:'uppercase', fontWeight:300 }}>From fabric to fabulous!</div>
        </div>
      </div>

      {/* Card */}
      <div className="fade-up" style={{
        margin:'-28px 16px 0',
        background:isDark?'rgba(26,21,48,0.92)':'rgba(255,255,255,0.97)',
        backdropFilter:'blur(28px)', borderRadius:T.r.xl,
        padding:'32px 24px 36px',
        border:`1px solid ${isDark?'rgba(155,127,212,0.2)':T.border}`,
        boxShadow:isDark?`0 -4px 0 0 rgba(155,127,212,0.4),0 24px 60px rgba(0,0,0,.7)`:T.sh.lg,
        position:'relative', zIndex:2,
      }}>
        <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:T.grad.brand, borderRadius:1, opacity:.6 }} />

        {step==='phone' ? (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, marginBottom:7 }}>Welcome back</div>
              <div style={{ fontSize:14, color:T.text2, lineHeight:1.6 }}>Enter your mobile to sign in</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:10, fontWeight:700, color:isDark?T.gold.d:T.violet.d, display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'.1em' }}>Mobile Number</label>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ padding:'13px 14px', borderRadius:T.r.md, fontSize:14, fontWeight:600, color:T.text2, background:isDark?'rgba(255,255,255,0.05)':T.bg2, border:`1.5px solid ${T.border}`, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>🇮🇳 +91</div>
                <input type="tel" value={phone} autoFocus onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="98765 43210"
                  style={{ flex:1, ...inputBase(false,T), letterSpacing:1.5 }} />
              </div>
            </div>
            {error&&<div style={{ fontSize:13, color:T.danger.text, background:T.danger.bg, padding:'10px 14px', borderRadius:T.r.md, marginBottom:14, border:`1px solid ${T.danger.border}` }}>{error}</div>}
            <PrimaryButton onClick={handleSend} disabled={digits.length!==10} loading={loading}>Send OTP →</PrimaryButton>
          </>
        ) : (
          <>
            <button onClick={()=>{setStep('phone');setError('');}} style={{ background:'none', border:'none', color:T.violet.d, fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:20, fontFamily:T.fontBody }}>← Change number</button>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, marginBottom:7 }}>Verify OTP</div>
              <div style={{ fontSize:14, color:T.text2 }}>Sent to <strong style={{ color:T.text }}>+91 {phone}</strong></div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:28 }}>
              {otp.map((d,i)=>(
                <input key={i} ref={el=>refs.current[i]=el} type="tel" maxLength={1} value={d} autoFocus={i===0}
                  onChange={e=>handleOtpChange(i,e.target.value)}
                  onKeyDown={e=>{if(e.key==='Backspace'&&!d&&i>0)refs.current[i-1]?.focus();if(e.key==='Enter')handleVerify();}}
                  style={{ width:46, height:58, textAlign:'center', fontSize:24, fontWeight:700, border:`2px solid ${d?T.violet.d:T.border}`, borderRadius:T.r.md, background:d?(isDark?'rgba(155,127,212,0.12)':T.violet.pale||'#f3eff9'):T.inputBg, color:d?T.violet.d:T.text, outline:'none', transition:'all .15s', fontFamily:T.fontBody, boxShadow:d?`0 0 0 3px ${isDark?'rgba(155,127,212,0.15)':'rgba(123,94,167,0.1)'}`:T.sh.inner, WebkitTextFillColor:d?T.violet.d:T.text }} />
              ))}
            </div>
            {error&&<div style={{ fontSize:13, color:T.danger.text, background:T.danger.bg, padding:'10px 14px', borderRadius:T.r.md, marginBottom:14, border:`1px solid ${T.danger.border}` }}>{error}</div>}
            <PrimaryButton onClick={handleVerify} disabled={otpFull.length!==6} loading={loading} style={{ marginBottom:16 }}>Verify & Sign in →</PrimaryButton>
            <div style={{ textAlign:'center' }}>
              {timer>0?<span style={{ fontSize:13, color:T.muted }}>Resend in <strong style={{ color:T.text2 }}>{timer}s</strong></span>
                :<button onClick={()=>{setStep('phone');setError('');setOtp(['','','','','','']);}} style={{ background:'none', border:'none', color:T.violet.d, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:T.fontBody }}>Resend OTP</button>}
            </div>
          </>
        )}
      </div>
      <div id="rc" />
      <p style={{ textAlign:'center', fontSize:11, color:T.muted, marginTop:22, position:'relative', zIndex:1 }}>🔒 Secured by Firebase Authentication</p>
    </div>
  );
}
