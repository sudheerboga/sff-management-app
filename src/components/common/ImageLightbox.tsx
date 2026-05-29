import { useEffect, useRef, useState } from 'react';
import { transformCloudinaryUrl } from '@/utils/cloudinary';

interface LightboxImage {
  url: string;
  note?: string;
  itemName?: string;
}

interface Props {
  images: LightboxImage[];
  startIndex: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, startIndex, onClose }: Props) {
  const [idx,    setIdx]    = useState(startIndex);
  const [showUI, setShowUI] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLImageElement>(null);

  // All gesture state lives in a ref — zero React re-renders during motion
  const g = useRef({
    scale: 1, tx: 0, ty: 0,
    mode: 'idle' as 'idle' | 'pinch' | 'pan',
    pinchStartDist: 0, pinchStartScale: 1,
    panLastX: 0, panLastY: 0,
    swipeStartX: 0, swipeStartY: 0,
    lastTapTime: 0,
  });

  // Reset transform when image changes
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transition = 'none';
    img.style.transform = 'translate(0px,0px) scale(1)';
    Object.assign(g.current, { scale: 1, tx: 0, ty: 0, mode: 'idle' });
    setShowUI(true);
  }, [idx]);

  // Non-passive touch listeners — direct DOM transform, no React render per frame
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function apply(scale: number, tx: number, ty: number, animate?: boolean) {
      const img = imgRef.current;
      if (!img) return;
      img.style.transition = animate ? 'transform 0.28s cubic-bezier(.25,.46,.45,.94)' : 'none';
      img.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
      g.current.scale = scale;
      g.current.tx = tx;
      g.current.ty = ty;
    }

    function pinchDist(t: TouchList) {
      return Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
    }

    function onStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        e.preventDefault();
        g.current.mode = 'pinch';
        g.current.pinchStartDist  = pinchDist(e.touches);
        g.current.pinchStartScale = g.current.scale;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        // double-tap: zoom to 2.5× or reset
        if (now - g.current.lastTapTime < 280) {
          e.preventDefault();
          if (g.current.scale > 1.2) {
            apply(1, 0, 0, true);
            setShowUI(true);
          } else {
            apply(2.5, 0, 0, true);
            setShowUI(false);
          }
          g.current.lastTapTime = 0;
          return;
        }
        g.current.lastTapTime = now;
        g.current.mode        = 'pan';
        g.current.panLastX    = e.touches[0].clientX;
        g.current.panLastY    = e.touches[0].clientY;
        g.current.swipeStartX = e.touches[0].clientX;
        g.current.swipeStartY = e.touches[0].clientY;
      }
    }

    function onMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 2 && g.current.mode === 'pinch') {
        const s = Math.min(5, Math.max(1,
          g.current.pinchStartScale * (pinchDist(e.touches) / g.current.pinchStartDist),
        ));
        apply(s, g.current.tx, g.current.ty);
      } else if (e.touches.length === 1 && g.current.mode === 'pan' && g.current.scale > 1) {
        const dx = e.touches[0].clientX - g.current.panLastX;
        const dy = e.touches[0].clientY - g.current.panLastY;
        g.current.panLastX = e.touches[0].clientX;
        g.current.panLastY = e.touches[0].clientY;
        apply(g.current.scale, g.current.tx + dx, g.current.ty + dy);
      }
    }

    function onEnd(e: TouchEvent) {
      // one finger lifted during pinch → keep panning with remaining finger
      if (e.touches.length === 1 && g.current.mode === 'pinch') {
        g.current.mode     = 'pan';
        g.current.panLastX = e.touches[0].clientX;
        g.current.panLastY = e.touches[0].clientY;
        return;
      }
      if (e.touches.length > 0) return;

      // all fingers up
      const { scale, mode, panLastX, panLastY, swipeStartX, swipeStartY } = g.current;

      if (scale < 1.1) {
        apply(1, 0, 0, true);
        setShowUI(true);
        // swipe to navigate (at 1×)
        if (mode === 'pan') {
          const dx = panLastX - swipeStartX;
          const dy = panLastY - swipeStartY;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            if (dx < 0) setIdx(i => Math.min(images.length - 1, i + 1));
            else        setIdx(i => Math.max(0, i - 1));
          }
        }
      } else {
        setShowUI(false);
      }
      g.current.mode = 'idle';
    }

    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove',  onMove,  { passive: false });
    el.addEventListener('touchend',   onEnd,   { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove',  onMove);
      el.removeEventListener('touchend',   onEnd);
    };
  }, [images.length]);

  const cur = images[idx];
  if (!cur) return null;

  const btn: React.CSSProperties = {
    border: 'none', cursor: 'pointer', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '50%', flexShrink: 0,
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 1400,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', touchAction: 'none',
      }}
    >
      {/* Image — transform applied directly via ref */}
      <img
        ref={imgRef}
        src={transformCloudinaryUrl(cur.url, 'w_1200,q_auto,f_auto')}
        alt=""
        draggable={false}
        style={{
          maxWidth: '100%', maxHeight: '100dvh',
          objectFit: 'contain',
          willChange: 'transform',
          userSelect: 'none', WebkitUserSelect: 'none',
          pointerEvents: 'none',
          display: 'block',
        }}
      />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: 'max(16px, env(safe-area-inset-top, 0px)) 16px 24px',
        background: 'linear-gradient(rgba(0,0,0,0.55), transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: showUI ? 1 : 0, transition: 'opacity 0.2s',
        pointerEvents: showUI ? 'auto' : 'none',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          {images.length > 1 ? `${idx + 1} / ${images.length}` : ''}
        </div>
        <button onClick={onClose} style={{ ...btn, width: 36, height: 36 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Left / right arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            style={{ ...btn, position: 'absolute', left: 14, width: 40, height: 40, opacity: showUI && idx > 0 ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: showUI && idx > 0 ? 'auto' : 'none' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => setIdx(i => Math.min(images.length - 1, i + 1))}
            style={{ ...btn, position: 'absolute', right: 14, width: 40, height: 40, opacity: showUI && idx < images.length - 1 ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: showUI && idx < images.length - 1 ? 'auto' : 'none' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}

      {/* Bottom bar — caption + dot indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '40px 20px max(20px, env(safe-area-inset-bottom, 0px)) 20px',
        background: (cur.note || cur.itemName || images.length > 1)
          ? 'linear-gradient(transparent, rgba(0,0,0,0.7))' : 'none',
        opacity: showUI ? 1 : 0, transition: 'opacity 0.2s',
        pointerEvents: 'none', textAlign: 'center',
      }}>
        {(cur.note || cur.itemName) && (
          <div style={{ color: '#fff', marginBottom: images.length > 1 ? 12 : 0 }}>
            {cur.itemName && <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 3 }}>{cur.itemName}</div>}
            {cur.note     && <div style={{ fontSize: 13, lineHeight: 1.5 }}>{cur.note}</div>}
          </div>
        )}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
            {images.map((_, i) => (
              <div key={i} style={{
                height: 5, borderRadius: 3,
                width: i === idx ? 18 : 5,
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'width 0.22s ease, background 0.22s',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Hint — visible only at 1× */}
      {showUI && (
        <div style={{
          position: 'absolute',
          bottom: 'max(70px, calc(env(safe-area-inset-bottom, 0px) + 60px))',
          fontSize: 10, color: 'rgba(255,255,255,0.22)',
          letterSpacing: '.05em', pointerEvents: 'none',
        }}>
          {images.length > 1 ? 'Swipe · Pinch to zoom · Double-tap' : 'Pinch to zoom · Double-tap'}
        </div>
      )}
    </div>
  );
}
