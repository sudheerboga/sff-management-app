import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function SplashScreen() {
  const { theme: T, isDark } = useTheme();
  const [p, setP] = useState(0);
  useEffect(() => {
    const t1=setTimeout(()=>setP(1),400); const t2=setTimeout(()=>setP(2),800); const t3=setTimeout(()=>setP(3),1100);
    return ()=>{ clearTimeout(t1);clearTimeout(t2);clearTimeout(t3); };
  }, []);

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:T.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', fontFamily:T.fontBody, transition:'background .3s' }}>
      <div style={{ position:'absolute', inset:0, background:T.grad.mesh, pointerEvents:'none' }} />
      {isDark && <>
        <div style={{ position:'absolute', top:'12%', left:'10%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(123,94,167,.18) 0%,transparent 70%)', animation:'orb1 8s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'8%', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,107,154,.15) 0%,transparent 70%)', animation:'orb2 10s ease-in-out infinite', pointerEvents:'none' }} />
      </>}
      <div style={{ position:'absolute', width:260, height:260, borderRadius:'50%', border:`1px solid ${T.isDark?'rgba(155,127,212,0.1)':'rgba(123,94,167,0.12)'}`, opacity:p>=1?1:0, transition:'opacity .8s', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', border:`1px solid ${T.isDark?'rgba(201,107,154,0.06)':'rgba(201,107,154,0.08)'}`, opacity:p>=1?1:0, transition:'opacity 1s .3s', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{ opacity:p>=0?1:0, transform:p>=0?'scale(1)':'scale(.6)', transition:'all .7s cubic-bezier(.34,1.56,.64,1)', marginBottom:32, position:'relative', zIndex:2, animation:p>=1?'float 4s ease-in-out infinite':'none' }}>
        <div style={{ position:'absolute', inset:-20, borderRadius:'50%', background:`radial-gradient(circle,${isDark?'rgba(155,127,212,.3)':'rgba(123,94,167,.15)'} 0%,transparent 70%)`, filter:'blur(12px)', zIndex:-1 }} />
        <div style={{ width:110, height:110, borderRadius:34, overflow:'hidden', background:isDark?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)', border:`1.5px solid ${isDark?'rgba(255,255,255,0.12)':'rgba(123,94,167,0.2)'}`, boxShadow:isDark?'0 20px 60px rgba(0,0,0,.6)':'0 20px 60px rgba(123,94,167,.2)' }}>
          <img src={process.env.PUBLIC_URL+'/logo.JPG'} alt="Sri Fashion Fusion" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}} />
        </div>
      </div>

      <div style={{ opacity:p>=1?1:0, transform:p>=1?'translateY(0)':'translateY(14px)', transition:'all .55s cubic-bezier(.4,0,.2,1) .1s', textAlign:'center', marginBottom:10, position:'relative', zIndex:2 }}>
        <div style={{ fontFamily:T.fontDisplay, fontSize:28, fontWeight:700, letterSpacing:'-.01em',
          background: isDark?'linear-gradient(135deg,#E8CC8A 0%,#D4AF6F 40%,#f0ecff 100%)':T.grad.brand,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Sri Fashion Fusion</div>
      </div>

      <div style={{ opacity:p>=2?1:0, transform:p>=2?'translateY(0)':'translateY(8px)', transition:'all .5s .15s', textAlign:'center', marginBottom:60, position:'relative', zIndex:2 }}>
        <div style={{ fontSize:12, color:isDark?'rgba(212,175,111,0.7)':T.muted, letterSpacing:'.2em', textTransform:'uppercase', fontWeight:300 }}>From fabric to fabulous!</div>
        <div style={{ width:40, height:1, background:isDark?T.grad.gold:T.grad.brand, margin:'12px auto 0', borderRadius:1, opacity:.5 }} />
      </div>

      <div style={{ position:'absolute', bottom:60, display:'flex', gap:8, opacity:p>=3?1:0, transition:'opacity .4s .3s', zIndex:2 }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:i===1?(isDark?T.gold.d:T.violet.d):`rgba(${isDark?'155,127,212':'123,94,167'},${.3+i*.15})`, animation:`pulse 1.4s ease-in-out ${i*.22}s infinite` }} />
        ))}
      </div>
    </div>
  );
}
