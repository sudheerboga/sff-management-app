const VIOLET = '#7B5EA7';
const VIOLET_DARK = '#9B7FD4';

function isDarkMode() {
  try {
    const stored = localStorage.getItem('boutique-ui');
    if (stored) return JSON.parse(stored)?.state?.themeMode === 'dark';
  } catch {}
  return false;
}

export default function LoadingScreen() {
  const dark = isDarkMode();
  const bg   = dark ? '#0f0a1e' : '#fdfaf7';
  const dot  = dark ? VIOLET_DARK : VIOLET;

  return (
    <>
      <style>{`
        @keyframes be-dot {
          0%, 80%, 100% { transform: scale(0); opacity: .25; }
          40%            { transform: scale(1);  opacity: 1;   }
        }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0,
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: '50%',
              background: dot,
              animation: `be-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </>
  );
}
