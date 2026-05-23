import { useState, useEffect, useRef } from 'react';
import { Drawer } from '@mui/material';
import { Order, OrderItem } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase } from '@/theme/appTheme';

interface SubmitData {
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  paidAmount: number;
  materialCost: number;
  deliveryDate: Date | null;
  orderDate: Date;
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitData) => Promise<void>;
  loading?: boolean;
  defaultValues?: Partial<Order>;
  title?: string;
}

interface ItemLine { id: number; name: string; amount: string }

const today = () => new Date().toISOString().split('T')[0];
const emptyLine = (): ItemLine => ({ id: Date.now() + Math.random(), name: '', amount: '' });

const calcBal  = (t: string, g: string) => Math.max(0, parseFloat(t || '0') - parseFloat(g || '0'));
const calcProf = (t: string, m: string) => parseFloat(t || '0') - parseFloat(m || '0');

function initLines(order?: Partial<Order>): ItemLine[] {
  if (order?.items?.length) {
    return order.items.map((i, idx) => ({ id: Date.now() + idx, name: i.garment, amount: String(i.amount) }));
  }
  return [emptyLine()];
}

export default function CreateOrderModal({ open, onClose, onSubmit, loading, defaultValues, title }: Props) {
  const { T, isDark } = useAppTheme();

  const [name,     setName]     = useState(defaultValues?.customerName || '');
  const [phone,    setPhone]    = useState(defaultValues?.customerPhone || '');
  const [orderDt,  setOrderDt]  = useState(defaultValues?.orderDate ? new Date(defaultValues.orderDate).toISOString().split('T')[0] : today());
  const [delivDt,  setDelivDt]  = useState(defaultValues?.deliveryDate ? new Date(defaultValues.deliveryDate).toISOString().split('T')[0] : '');
  const [material, setMaterial] = useState(defaultValues?.materialCost?.toString() || '0');
  const [paid,     setPaid]     = useState(defaultValues?.paidAmount?.toString() || '0');
  const [notes,    setNotes]    = useState(defaultValues?.notes || '');
  const [lines,    setLines]    = useState<ItemLine[]>(() => initLines(defaultValues));

  const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(defaultValues?.customerName || '');
      setPhone(defaultValues?.customerPhone || '');
      setOrderDt(defaultValues?.orderDate ? new Date(defaultValues.orderDate).toISOString().split('T')[0] : today());
      setDelivDt(defaultValues?.deliveryDate ? new Date(defaultValues.deliveryDate).toISOString().split('T')[0] : '');
      setMaterial(defaultValues?.materialCost?.toString() || '0');
      setPaid(defaultValues?.paidAmount?.toString() || '0');
      setNotes(defaultValues?.notes || '');
      setLines(initLines(defaultValues));
    }
  }, [open]);

  const itemTotal = lines.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);
  const balance   = calcBal(String(itemTotal), paid);
  const profit    = calcProf(String(itemTotal), material);

  function updateLine(id: number, field: 'name' | 'amount', val: string) {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
  }
  function addLine() { setLines(prev => [...prev, emptyLine()]); }
  function removeLine(id: number) {
    setLines(prev => {
      const next = prev.filter(l => l.id !== id);
      return next.length ? next : [emptyLine()];
    });
  }

  async function handleSave() {
    if (!name.trim()) return;
    const orderItems: OrderItem[] = lines
      .filter(l => l.name.trim() && parseFloat(l.amount) > 0)
      .map(l => ({ garment: l.name.trim(), description: '', qty: 1, rate: parseFloat(l.amount), amount: parseFloat(l.amount), profit: 0 }));
    if (!orderItems.length) return;
    await onSubmit({
      customerName: name,
      customerPhone: phone,
      items: orderItems,
      paidAmount: parseFloat(paid) || 0,
      materialCost: parseFloat(material) || 0,
      deliveryDate: delivDt ? new Date(delivDt) : null,
      orderDate: new Date(orderDt || today()),
      notes,
    });
    onClose();
  }

  // Drag-to-close
  const sheetRef     = useRef<HTMLDivElement>(null);
  const dragStartY   = useRef<number | null>(null);
  const dragCurY     = useRef<number | null>(null);
  const dragging     = useRef(false);
  const CLOSE_THRESH = 120;

  function onDragStart(e: React.TouchEvent | React.MouseEvent) {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = y; dragCurY.current = y; dragging.current = true;
  }
  function onDragMove(e: React.TouchEvent | React.MouseEvent) {
    if (!dragging.current || dragStartY.current === null) return;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = y - dragStartY.current;
    dragCurY.current = y;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
      sheetRef.current.style.transition = 'none';
    }
  }
  function onDragEnd() {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = (dragCurY.current || 0) - (dragStartY.current || 0);
    if (sheetRef.current) {
      if (delta >= CLOSE_THRESH) {
        sheetRef.current.style.transition = 'transform .28s cubic-bezier(.4,0,.2,1)';
        sheetRef.current.style.transform = 'translateY(110%)';
        setTimeout(onClose, 280);
      } else {
        sheetRef.current.style.transition = 'transform .25s cubic-bezier(.34,1.56,.64,1)';
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
    dragStartY.current = null; dragCurY.current = null;
  }

  const sheetBg  = T.isDark ? 'rgba(14,11,26,0.98)' : 'rgba(255,255,255,0.98)';
  const sectionBg = T.isDark ? 'rgba(26,21,48,0.7)' : T.bg;
  const secBorder = T.isDark ? 'rgba(155,127,212,0.15)' : T.border;
  const labelColor = isDark ? T.gold.d : T.violet.d;

  const sectionStyle: React.CSSProperties = { background: sectionBg, borderRadius: T.r.lg, padding: 16, marginBottom: 10, border: `1px solid ${secBorder}`, boxShadow: T.sh.xs };
  const sectionLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 };

  const fi = (id: string) => `focus-${id}`;

  function FInput({ label, value, onChange, type = 'text', prefix, id }: { label: string; value: string; onChange: (v: string) => void; type?: string; prefix?: string; id: string }) {
    const focused = focusedId === fi(id);
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: focused ? (isDark ? T.gold.d : T.violet.d) : T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody, transition: 'color .2s' }}>{label}</label>
        {prefix ? (
          <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${focused ? T.violet.d : T.border}`, borderRadius: T.r.md, background: focused ? T.inputFocusBg : T.inputBg, overflow: 'hidden', transition: 'all .2s', boxShadow: focused ? `0 0 0 3px ${isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.12)'}` : T.sh.inner }}>
            <span style={{ padding: '0 6px 0 12px', fontSize: 14, fontWeight: 700, color: T.muted }}>{prefix}</span>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocusedId(fi(id))} onBlur={() => setFocusedId(null)} style={{ flex: 1, padding: '12px 12px 12px 2px', border: 'none', outline: 'none', fontSize: 15, fontFamily: T.fontBody, background: 'transparent', color: T.text, WebkitTextFillColor: T.text, fontWeight: 600 }} />
          </div>
        ) : (
          <input type={type} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocusedId(fi(id))} onBlur={() => setFocusedId(null)} style={{ ...inputBase(focused, T) }} />
        )}
      </div>
    );
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: sheetBg,
          backdropFilter: 'blur(30px)',
          borderRadius: `${T.r.xxl}px ${T.r.xxl}px 0 0`,
          maxHeight: '92dvh',
          overflowY: 'auto',
          fontFamily: T.fontBody,
          border: `1px solid ${secBorder}`,
          borderBottom: 'none',
          boxShadow: T.isDark ? '0 -20px 60px rgba(0,0,0,.8)' : '0 -8px 40px rgba(26,22,37,.15)',
          padding: 0,
          backgroundImage: 'none',
        },
      }}
    >
      <div ref={sheetRef} style={{ padding: '0 20px 52px', fontFamily: T.fontBody }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: T.grad.brand, opacity: .5 }} />

        {/* Drag handle */}
        <div
          style={{ padding: '14px 0 8px', cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
          onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}
          onMouseMove={e => { if (dragging.current) onDragMove(e); }}
          onMouseUp={onDragEnd}
        >
          <div style={{ width: 36, height: 4, background: T.isDark ? 'rgba(255,255,255,0.18)' : T.border, borderRadius: T.r.pill, margin: '0 auto' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 4 }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 21, fontWeight: 600, color: T.text, letterSpacing: '-.01em' }}>
              {title || (defaultValues?.id ? 'Edit Order' : 'New Order')}
            </div>
            {defaultValues?.orderNumber && (
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontFamily: 'monospace' }}>#{defaultValues.orderNumber}</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: T.isDark ? 'rgba(255,255,255,0.06)' : T.bg2, border: `1px solid ${T.border}`, width: 34, height: 34, borderRadius: '50%', fontSize: 18, cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Customer section */}
        <div style={sectionStyle}>
          <div style={sectionLabel}>
            <div style={{ width: 14, height: 1, background: T.grad.brand, opacity: .6 }} />Customer Details
          </div>
          <FInput label="Customer Name *" value={name} onChange={setName} id="name" />
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Mobile Number</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ padding: '13px 12px', borderRadius: T.r.md, fontSize: 14, fontWeight: 600, color: T.text2, background: T.isDark ? 'rgba(255,255,255,0.05)' : T.bg2, border: `1.5px solid ${T.border}`, whiteSpace: 'nowrap' }}>🇮🇳 +91</div>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="00000 00000"
                onFocus={e => { e.target.style.borderColor = T.violet.d; e.target.style.background = T.inputFocusBg; }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.background = T.inputBg; }}
                style={{ ...inputBase(false, T), flex: 1, letterSpacing: 1.2 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Order Date</label>
              <input type="date" value={orderDt} onChange={e => setOrderDt(e.target.value)} style={{ ...inputBase(false, T), colorScheme: isDark ? 'dark' : 'light' }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Delivery Date</label>
              <input type="date" value={delivDt} onChange={e => setDelivDt(e.target.value)} style={{ ...inputBase(false, T), colorScheme: isDark ? 'dark' : 'light' }} />
            </div>
          </div>
        </div>

        {/* Items section */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={sectionLabel}>
              <div style={{ width: 14, height: 1, background: T.grad.brand, opacity: .6 }} />Item-wise Amounts
            </div>
            {itemTotal > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: T.violet.d, background: isDark ? 'rgba(155,127,212,0.15)' : '#f3eff9', padding: '3px 10px', borderRadius: T.r.pill, border: `1px solid ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '33'}` }}>
                Total ₹{itemTotal.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {lines.map((line, idx) => (
              <div key={line.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={line.name}
                  onChange={e => updateLine(line.id, 'name', e.target.value)}
                  placeholder={`Item ${idx + 1} e.g. Blouse`}
                  style={{ flex: 2, ...inputBase(false, T), marginBottom: 0, fontSize: 13, padding: '10px 12px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: `1.5px solid ${T.border}`, borderRadius: T.r.md, background: isDark ? 'rgba(255,255,255,0.03)' : T.bg, overflow: 'hidden' }}>
                  <span style={{ padding: '0 6px 0 10px', fontSize: 13, fontWeight: 700, color: T.muted }}>₹</span>
                  <input
                    type="number"
                    value={line.amount}
                    onChange={e => updateLine(line.id, 'amount', e.target.value)}
                    placeholder="0"
                    style={{ flex: 1, padding: '10px 8px 10px 2px', border: 'none', fontSize: 14, fontFamily: T.fontBody, background: 'transparent', color: T.text, outline: 'none', WebkitTextFillColor: T.text, fontWeight: 700 }}
                  />
                </div>
                {lines.length > 1 && (
                  <button onClick={() => removeLine(line.id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(248,113,113,0.12)' : '#fdeaea', border: 'none', borderRadius: T.r.sm, cursor: 'pointer', color: T.danger.text, fontSize: 14, flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
          </div>

          <button onClick={addLine} style={{ width: '100%', padding: '9px 0', background: isDark ? 'linear-gradient(135deg,rgba(155,127,212,0.06),rgba(201,107,154,0.04))' : 'linear-gradient(135deg,#f3eff9,#fdf0f6)', border: `1.5px dashed ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '55'}`, borderRadius: T.r.md, color: T.violet.d, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>+</span> Add Item
          </button>

          <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Additional Info (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Fabric notes, fitting instructions…"
            rows={3}
            style={{ ...inputBase(false, T), resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Payment section */}
        <div style={sectionStyle}>
          <div style={sectionLabel}>
            <div style={{ width: 14, height: 1, background: T.grad.brand, opacity: .6 }} />Payment Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FInput label="Material Cost" value={material} onChange={setMaterial} type="number" prefix="₹" id="material" />
            <FInput label="Amount Given" value={paid} onChange={setPaid} type="number" prefix="₹" id="paid" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: T.isDark ? 'rgba(255,255,255,0.03)' : T.bg2, borderRadius: T.r.md, padding: '14px 15px', border: `1px solid ${T.border}`, marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Balance Due</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: T.danger.text, letterSpacing: '-.01em' }}>₹{balance.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Profit</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: profit >= 0 ? T.success.text : T.danger.text, letterSpacing: '-.01em' }}>₹{profit.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          style={{ marginBottom: '1.5rem', width: '100%', padding: 14, background: (loading || !name.trim()) ? (isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand, color: (loading || !name.trim()) ? T.muted : '#fff', border: 'none', borderRadius: T.r.md, fontSize: 15, fontFamily: T.fontBody, fontWeight: 600, cursor: (loading || !name.trim()) ? 'not-allowed' : 'pointer', letterSpacing: '.02em', transition: 'all .2s', boxShadow: (loading || !name.trim()) ? 'none' : T.sh.brand, opacity: (loading || !name.trim()) ? .5 : 1 }}
        >
          {loading ? 'Saving…' : (defaultValues?.id ? 'Update Order' : '+ Save Order')}
        </button>
      </div>
    </Drawer>
  );
}
