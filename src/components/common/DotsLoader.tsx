const VIOLET = '#7B5EA7';

export default function DotsLoader() {
  return (
    <>
      <style>{`
        @keyframes dl-pulse {
          0%,100% { opacity:.25; transform:scale(.7); }
          50%      { opacity:1;   transform:scale(1);  }
        }
      `}</style>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 0',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%',
              background: VIOLET,
              animation: `dl-pulse 1.3s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </>
  );
}
