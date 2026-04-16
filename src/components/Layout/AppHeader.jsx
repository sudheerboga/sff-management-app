import React, { useState } from 'react';
import { logOut } from '../../firebase/authService';
import { T } from '../../styles/theme';
import { Logo, Avatar } from '../shared';

export default function AppHeader({ user }) {
  const [menu,setMenu] = useState(false);
  const phone = user?.phoneNumber?.replace('+91','').replace(/(\d{5})(\d{5})/,'$1 $2')||'User';

  return (
    <div style={{ background:'linear-gradient(230deg, rgb(74 111 212 / 50%) 0%, rgb(123 94 167 / 50%) 40%, rgb(201 107 154 / 50%) 100%)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', padding:'12px 20px 10px', borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:40, fontFamily:T.fontBody }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <Logo size={38} showText textSize={14} />
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:T.r.pill, background:T.success.bg, border:`1px solid ${T.success.border}` }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:T.success.text }} />
          <span style={{ fontSize:10, fontWeight:700, color:T.success.text, letterSpacing:'.04em' }}>Live</span>
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={()=>setMenu(s=>!s)} style={{ border:'none', background:'none', cursor:'pointer', padding:0 }}><Avatar name={phone} size={36} /></button>
          {menu&&(
            <>
              <div onClick={()=>setMenu(false)} style={{ position:'fixed', inset:0, zIndex:49 }} />
              <div style={{ position:'absolute', right:0, top:44, background:T.card, border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:10, zIndex:50, minWidth:190, boxShadow:T.sh.lg }}>
                <div style={{ padding:'6px 10px 12px', borderBottom:`1px solid ${T.border}`, marginBottom:6 }}>
                  <div style={{ fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:2 }}>Signed in as</div>
                  <div style={{ fontSize:14, fontWeight:600, color:T.text }}>+91 {phone}</div>
                </div>
                <button onClick={async()=>{ if(window.confirm('Sign out?')) await logOut(); setMenu(false); }} style={{ width:'100%', padding:'10px', background:'none', border:'none', textAlign:'left', fontSize:14, fontWeight:600, color:T.danger.text, cursor:'pointer', fontFamily:T.fontBody }}>
                  🚪 Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
