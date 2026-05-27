import { useState } from 'react';
import { Drawer } from '@mui/material';
import { format } from 'date-fns';
import { Order } from '@/types';
import DateInput from '@/components/common/DateInput';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';

import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useNavigate } from 'react-router-dom';

const STATUSES: { v: Order['status']; label: string }[] = [
  { v: 'in-progress', label: 'In Progress' },
  { v: 'delivered',   label: 'Delivered'   },
];

type GarmentKey = 'saree' | 'lehenga' | 'dress' | 'kurti' | 'shirt' | 'pant' | 'salwar' | 'jacket' | 'default';

const GARMENT_RULES: [GarmentKey, ...string[]][] = [
  ['saree',   'saree', 'sari'],
  ['lehenga', 'leheng', 'lehan'],
  ['dress',   'blouse', 'gown', 'skirt', 'frock', 'dress'],
  ['kurti',   'kurti', 'kurta', 'top'],
  ['shirt',   'shirt', 'tshirt'],
  ['pant',    'pant', 'trouser', 'jean', 'bottom', 'palazzo'],
  ['salwar',  'salwar', 'dupatta', 'chunni'],
  ['jacket',  'churidar', 'churidhar', 'jacket', 'coat', 'shrug'],
];

const sp = { viewBox: '0 0 20 20', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const GARMENT_SVG: Record<GarmentKey, JSX.Element> = {
  saree: (
    <svg {...sp}>
      {/* wrapped body */}
      <path d="M6 3 L4.5 17.5 Q4.5 18.5 6 18.5 L14 18.5 Q15.5 18.5 15.5 17.5 L14 3" />
      {/* diagonal pallu drape */}
      <path d="M6 3 Q10 6.5 14 9.5" />
      {/* pleats at hem */}
      <path d="M8.5 14 L8 18.5 M10 13.5 L10 18.5 M11.5 14 L12 18.5" />
    </svg>
  ),
  lehenga: (
    <svg {...sp}>
      {/* bodice */}
      <path d="M7.5 2 Q10 3.5 12.5 2 L12.5 7 L7.5 7 Z" />
      {/* dramatic flared skirt */}
      <path d="M7.5 7 L2.5 18.5 L17.5 18.5 L12.5 7" />
      {/* tier / embroidery lines on skirt */}
      <path d="M4.5 12.5 Q10 10.5 15.5 12.5" />
      <path d="M3.5 16 Q10 13.5 16.5 16" />
    </svg>
  ),
  dress: (
    <svg {...sp}>
      {/* scoop neck */}
      <path d="M7.5 2 Q10 4.5 12.5 2" />
      {/* short sleeves */}
      <path d="M7.5 2 L5.5 5.5 M12.5 2 L14.5 5.5" />
      {/* A-line body */}
      <path d="M5.5 5.5 L4.5 18.5 L15.5 18.5 L14.5 5.5" />
      {/* waist seam */}
      <path d="M6.5 10.5 Q10 9.5 13.5 10.5" />
    </svg>
  ),
  kurti: (
    <svg {...sp}>
      {/* band collar */}
      <path d="M8 2 L8 3.5 Q10 4.5 12 3.5 L12 2 Q10 1 8 2 Z" />
      {/* 3/4 sleeves */}
      <path d="M8 3.5 L5 5 L4.5 12 M12 3.5 L15 5 L15.5 12" />
      {/* long tunic body */}
      <path d="M5 5 L4.5 18.5 L7.5 18.5 Q10 19.5 12.5 18.5 L15.5 18.5 L15 5" />
      {/* side slit */}
      <path d="M7.5 15 L4.5 18.5" />
      {/* centre placket line */}
      <path d="M10 4.5 L10 9" />
    </svg>
  ),
  shirt: (
    <svg {...sp}>
      {/* spread collar */}
      <path d="M8.5 2 L7 4.5 L10 5.5 L13 4.5 L11.5 2" />
      {/* sleeves */}
      <path d="M8.5 2 L5 7 L5.5 8.5 M11.5 2 L15 7 L14.5 8.5" />
      {/* body */}
      <path d="M5.5 8.5 L5 18.5 L15 18.5 L14.5 8.5" />
      {/* placket */}
      <line x1="10" y1="5.5" x2="10" y2="18.5" />
      {/* buttons */}
      <circle cx="10" cy="10" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="10" cy="13" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="10" cy="16" r="0.65" fill="currentColor" stroke="none" />
    </svg>
  ),
  pant: (
    <svg {...sp}>
      {/* waistband */}
      <rect x="4.5" y="2" width="11" height="2.5" rx="1.2" />
      {/* left leg */}
      <path d="M4.5 4.5 L5 18.5 Q5 19.5 6.5 19.5 L9.5 19.5 Q10 19.5 10 18.5 L10 11" />
      {/* right leg */}
      <path d="M15.5 4.5 L15 18.5 Q15 19.5 13.5 19.5 L10.5 19.5 Q10 19.5 10 18.5 L10 11" />
      {/* crease lines */}
      <path d="M7 4.5 L7.5 18.5 M13 4.5 L12.5 18.5" strokeDasharray="1.5 1.5" strokeWidth={0.9} />
    </svg>
  ),
  salwar: (
    <svg {...sp}>
      {/* gathered waist with drawstring */}
      <path d="M5 3.5 L15 3.5" />
      <path d="M10 2 L10 5" />
      <path d="M7 2.5 L7 4.5 M13 2.5 L13 4.5" strokeWidth={0.9} />
      {/* wide legs */}
      <path d="M5 3.5 L2 18 Q2 19.5 4 19.5 L9 19.5 Q10 19.5 10 18 L10 11" />
      <path d="M15 3.5 L18 18 Q18 19.5 16 19.5 L11 19.5 Q10 19.5 10 18 L10 11" />
      {/* ankle gather marks */}
      <path d="M3 17 L2 19.5 M5 17.5 L4 19.5" strokeWidth={0.9} />
      <path d="M17 17 L18 19.5 M15 17.5 L16 19.5" strokeWidth={0.9} />
    </svg>
  ),
  jacket: (
    <svg {...sp}>
      {/* left lapel */}
      <path d="M8 2 L6 6.5 L10 8.5" />
      {/* right lapel */}
      <path d="M12 2 L14 6.5 L10 8.5" />
      {/* sleeves */}
      <path d="M6 6.5 L4 15 L5.5 15.5 M14 6.5 L16 15 L14.5 15.5" />
      {/* body */}
      <path d="M6 6.5 L5.5 18.5 L14.5 18.5 L14 6.5" />
      {/* front opening */}
      <line x1="10" y1="8.5" x2="10" y2="18.5" />
      {/* buttons */}
      <circle cx="10" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
      {/* pocket */}
      <path d="M12 14 L13.5 14 L13.5 16.5 L12 16.5" strokeWidth={0.9} />
    </svg>
  ),
  default: (
    <svg {...sp}>
      {/* needle */}
      <path d="M5.5 16 L14.5 4.5" strokeWidth={1.5} />
      {/* needle eye */}
      <path d="M13.5 4 Q15 3.5 15.5 5 Q15 6 13.5 5.5" />
      {/* thread */}
      <path d="M6 15.5 Q3.5 10 7.5 7 Q11.5 4 13 6.5" strokeWidth={1.1} strokeDasharray="2 1.2" />
    </svg>
  ),
};

function garmentIcon(name: string): JSX.Element {
  const lower = name.toLowerCase().replace(/[^a-z\s]/g, '');
  for (const [type, ...stems] of GARMENT_RULES) {
    if (stems.some((s) => lower.split(/\s+/).some((word) => word.startsWith(s)))) return GARMENT_SVG[type];
  }
  return GARMENT_SVG.default;
}

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: Order['status']) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function OrderDetailDrawer({ order, open, onClose, onStatusChange, onEdit, onDelete }: Props) {
  const { T, isDark } = useAppTheme();
  const user    = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const navigate = useNavigate();
  const { query: measurementsQuery } = useMeasurements();
  const { addPaymentMutation, updateMaterialCostMutation } = useOrders();

  const [payFormOpen,  setPayFormOpen]  = useState(false);
  const [payAmount,    setPayAmount]    = useState('');
  const [payDate,      setPayDate]      = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [payNote,      setPayNote]      = useState('');
  const [matFormOpen,  setMatFormOpen]  = useState(false);
  const [matCostValue, setMatCostValue] = useState('');

  if (!order) return null;

  const allMeasurements = measurementsQuery.data || [];
  const memberMeasurements = order.customerId
    ? allMeasurements.filter((m) =>
        m.customerId === order.customerId &&
        (order.memberId ? m.memberId === order.memberId : m.memberName === order.memberName),
      )
    : allMeasurements.filter((m) => m.customerPhone === order.customerPhone);

  const allImages = order.items.flatMap((item) =>
    (item.images || []).map((img) => ({ ...img, itemName: item.garment })),
  );

  const profit = order.totalAmount - (order.materialCost || 0);

  const statusColor = (s: Order['status']): { text: string; bg: string } => {
    if (s === 'in-progress') return { text: T.blue.d,       bg: T.blue.pale  };
    if (s === 'delivered')   return { text: T.success.text, bg: T.success.bg };
    return { text: T.muted, bg: T.bg2 };
  };

  const rowBg  = isDark ? 'rgba(255,255,255,0.03)' : T.bg2;
  const sc     = statusColor(order.status);
  const totalItems = order.items.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 420 },
          background: isDark ? T.bg : 'rgb(250 248 246)',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          borderLeft: `1px solid ${T.border}`,
        },
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 20px 0',
        fontFamily: T.fontBody,
        background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        borderBottom: `1px solid ${T.border}`,
      }}>
        {/* Top row: name + close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: T.text, fontFamily: T.fontDisplay, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              {order.customerName}
            </div>
            {order.memberName && order.memberName !== order.customerName && (
              <div style={{ fontSize: 12, color: T.violet.d, fontWeight: 600, marginTop: 2 }}>
                For {order.memberName}
              </div>
            )}
            {order.customerPhone && (
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{order.customerPhone}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
            {!isStaff && (
              <>
              <button
                  onClick={onDelete}
                  style={{ width: 34, height: 34, borderRadius: T.r.sm, border: `1.5px solid ${T.danger.border}`, background: T.danger.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger.text }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
                <button
                  onClick={onEdit}
                  style={{ width: 34, height: 34, borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2 }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{ marginLeft: '10px', width: 34, height: 34, borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, fontFamily: 'monospace', background: rowBg, padding: '3px 9px', borderRadius: T.r.sm, border: `1px solid ${T.border}` }}>
            #{order.orderNumber}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: T.r.sm, background: sc.bg, color: sc.text }}>
            {STATUSES.find(s => s.v === order.status)?.label || order.status}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: T.r.sm, background: `${T.violet.d}12`, color: T.violet.d }}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
          <span style={{ fontSize: 11, color: T.muted, marginLeft: 2 }}>
            {format(order.orderDate, 'd MMM yyyy')}
            {order.deliveryDate && ` → ${format(order.deliveryDate, 'd MMM yyyy')}`}
          </span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, fontFamily: T.fontBody }}>

        {/* Status change */}
        {!isStaff && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Update Status</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUSES.map(({ v, label }) => {
                const active = order.status === v;
                const c = statusColor(v);
                return (
                  <button
                    key={v}
                    onClick={() => onStatusChange(v)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: T.r.sm,
                      border: `1.5px solid ${active ? c.text + '55' : T.border}`,
                      background: active ? c.bg : 'none',
                      color: active ? c.text : T.text2,
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      fontFamily: T.fontBody, cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {active && <span style={{ marginRight: 5 }}>✓</span>}{label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ITEMS — hero section ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.1em' }}>Items Ordered</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.violet.d, background: `${T.violet.d}12`, padding: '2px 9px', borderRadius: T.r.pill }}>
              {totalItems} {totalItems === 1 ? 'piece' : 'pieces'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.items.map((item, i) => {
              const imgs = item.images || [];
              return (
                <div
                  key={i}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                    borderRadius: T.r.md,
                    border: `1.5px solid ${T.border}`,
                    overflow: 'hidden',
                    boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Item header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
                    {/* Icon + number */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: T.r.sm,
                        background: `${T.violet.d}12`, border: `1.5px solid ${T.violet.d}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: T.violet.d,
                      }}>
                        {garmentIcon(item.garment)}
                      </div>
                      <div style={{
                        position: 'absolute', top: -5, right: -5,
                        width: 17, height: 17, borderRadius: '50%',
                        background: T.violet.d, color: '#fff',
                        fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${isDark ? T.bg : 'rgb(250 248 246)'}`,
                      }}>
                        {i + 1}
                      </div>
                    </div>

                    {/* Name + label */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{item.garment}</div>
                      {item.description ? (
                        <div style={{ fontSize: 12, color: T.text2, marginTop: 3, lineHeight: 1.4 }}>{item.description}</div>
                      ) : (
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                          {imgs.length > 0 ? `${imgs.length} reference ${imgs.length === 1 ? 'image' : 'images'}` : 'No reference images'}
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1 }}>
                        ₹{item.amount.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: 8, color: T.muted, marginTop: 2, fontWeight: 600 }}>AMOUNT</div>
                    </div>
                  </div>

                  {/* Images — horizontal scroll strip */}
                  {imgs.length > 0 && (
                    <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 14px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {imgs.map((img) => {
                          const globalIdx = allImages.findIndex((x) => x.url === img.url && x.publicId === img.publicId);
                          return (
                            <div
                              key={img.publicId || img.url}
                              onClick={() => setLightboxIdx(globalIdx)}
                              style={{ flexShrink: 0, cursor: 'pointer' }}
                            >
                              <div style={{
                                width: 90, height: 110,
                                borderRadius: T.r.sm,
                                overflow: 'hidden',
                                border: `1.5px solid ${T.border}`,
                              }}>
                                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              </div>
                              {/* {img.note && (
                                <div style={{ width: 90, fontSize: 10, color: T.text2, marginTop: 4, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  {img.note}
                                </div>
                              )} */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Items total */}
          {/* <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, paddingRight: 2 }}>
            <span style={{ fontSize: 12, color: T.muted, marginRight: 8 }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.text }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div> */}
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{
            background: isDark ? 'rgba(255,220,100,0.05)' : 'rgba(255,220,100,0.12)',
            borderRadius: T.r.md,
            border: `1.5px solid rgba(200,165,0,0.25)`,
            padding: '12px 14px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(150,120,0,0.8)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Notes</div>
              <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.6 }}>{order.notes}</p>
            </div>
          </div>
        )}

        {/* Customer Measurements */}
        <button
          onClick={() => {
            onClose();
            if (memberMeasurements.length > 0) {
              navigate(`/measurements/view/${memberMeasurements[0].id}`, { state: { measurement: memberMeasurements[0] } });
            } else {
              navigate('/measurements/new', {
                state: {
                  prefillCustomer: {
                    customerId:    order.customerId,
                    customerName:  order.customerName,
                    customerPhone: order.customerPhone,
                    memberName:    order.memberName,
                    memberId:      order.memberId,
                  },
                },
              });
            }
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: rowBg, border: `1.5px solid ${T.border}`, borderRadius: T.r.md, cursor: 'pointer', fontFamily: T.fontBody, textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: T.r.sm, background: `${T.violet.d}12`, border: `1px solid ${T.violet.d}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" fill="none" stroke={T.violet.d} strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="18" x2="13" y2="18"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                {order.memberName && order.memberName !== order.customerName
                  ? `${order.memberName}'s Measurements`
                  : 'Customer Measurements'}
              </div>
              {memberMeasurements.length > 0 ? (
                <div style={{ fontSize: 11, color: T.blue.d, marginTop: 2 }}>
                  {Object.keys(memberMeasurements[0].garments).length} garments saved · Tap to view
                </div>
              ) : (
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Not added yet · Tap to add</div>
              )}
            </div>
          </div>
          <svg width="14" height="14" fill="none" stroke={T.muted} strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* ── Payment — UNCHANGED ── */}
        <div style={{ borderRadius: T.r.md, border: `1px solid ${T.border}`, backgroundColor: 'white' }}>

          {/* ── Top: Total Bill + Balance Due highlighted ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '14px 16px', borderRight: `1px solid ${T.border}`, borderRadius: `${T.r.md} 0 0 0` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Total Bill</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: T.fontBody, lineHeight: 1 }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: order.balanceAmount > 0 ? `${T.danger.text}12` : `${T.success.text}12`, borderRadius: `0 14px 0 0` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: order.balanceAmount > 0 ? T.danger.text : T.success.text, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4}}>
                {order.balanceAmount > 0 ? 'Balance Due' : 'Fully Paid'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: order.balanceAmount > 0 ? T.danger.text : T.success.text, fontFamily: T.fontBody, lineHeight: 1 }}>
                ₹{order.balanceAmount > 0 ? order.balanceAmount.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>

          {/* ── Progress bar ── */}
          {order.totalAmount > 0 && (
            <div style={{ padding: '10px 16px 0', borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBody }}>Paid ₹{order.paidAmount.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.success.text, fontFamily: T.fontBody }}>
                  {Math.round((order.paidAmount / order.totalAmount) * 100)}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: T.border, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 3, background: order.balanceAmount > 0 ? T.success.text : T.success.text, width: `${Math.min(100, Math.round((order.paidAmount / order.totalAmount) * 100))}%`, transition: 'width .3s ease' }} />
              </div>
            </div>
          )}

          {/* ── Payment history + Add button ── */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: order.payments?.length ? 12 : 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Payment History
              </span>
              <button
                onClick={() => { setPayFormOpen((v) => !v); setPayAmount(''); setPayDate(format(new Date(), 'yyyy-MM-dd')); setPayNote(''); }}
                style={{ fontSize: 12, fontWeight: 700, color: T.violet.d, background: `${T.violet.d}14`, border: `1px solid ${T.violet.d}33`, borderRadius: T.r.sm, padding: '4px 10px', cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Payment
              </button>
            </div>

            {/* Timeline */}
            {order.payments && order.payments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {order.payments.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.success.text, border: `2px solid ${T.success.text}33`, flexShrink: 0 }} />
                      {i < order.payments.length - 1 && (
                        <div style={{ width: 2, height: 28, background: T.border, borderRadius: 1 }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: i < order.payments.length - 1 ? 4 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.success.text, fontFamily: T.fontBody }}>
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: 11, color: T.muted }}>{format(p.date, 'd MMM yyyy')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {p.note && <span style={{ fontSize: 11, color: T.text2, fontStyle: 'italic' }}>{p.note}</span>}
                        {p.note && <span style={{ color: T.border }}>·</span>}
                        <span style={{ fontSize: 10, color: T.muted }}>{p.recordedBy}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: T.r.pill, background: p.recordedByRole === 'staff' ? `${T.blue.d}18` : `${T.violet.d}14`, color: p.recordedByRole === 'staff' ? T.blue.d : T.violet.d, textTransform: 'capitalize' }}>
                          {p.recordedByRole || 'admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !payFormOpen && (
                <div style={{ fontSize: 12, color: T.muted, textAlign: 'center', padding: '8px 0', fontStyle: 'italic' }}>No payments recorded yet</div>
              )
            )}

            {/* Inline add-payment form */}
            {payFormOpen && (
              <div style={{ marginTop: order.payments?.length ? 12 : 0, borderTop: order.payments?.length ? `1px solid ${T.border}` : 'none', paddingTop: order.payments?.length ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Amount (₹)</div>
                    <input
                      type="number"
                      placeholder="0"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <DateInput label="Date" value={payDate} onChange={setPayDate} padding="8px 12px" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Note (optional)</div>
                  <input
                    type="text"
                    placeholder="e.g. Advance, Final payment…"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPayFormOpen(false)}
                    style={{ flex: 1, padding: '9px 0', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!payAmount || Number(payAmount) <= 0 || addPaymentMutation.isPending}
                    onClick={async () => {
                      const entry = {
                        id: Date.now().toString(36),
                        amount: Number(payAmount),
                        date: new Date(payDate),
                        note: payNote.trim(),
                        recordedBy: user?.name || '',
                        recordedById: user?.uid || '',
                        recordedByRole: user?.role || 'admin',
                      };
                      const updated = [...(order.payments || []), entry];
                      await addPaymentMutation.mutateAsync({ orderId: order.id, payments: updated, totalAmount: order.totalAmount });
                      setPayFormOpen(false);
                    }}
                    style={{ flex: 2, padding: '9px 0', borderRadius: T.r.sm, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', opacity: (!payAmount || Number(payAmount) <= 0) ? 0.5 : 1 }}
                  >
                    {addPaymentMutation.isPending ? 'Saving…' : 'Save Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Material Cost + Profit ── */}
          <div style={{ borderTop: `1px solid ${T.border}`, borderRadius: `0 0 ${T.r.md} ${T.r.md}` }}>
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBody }}>
                Material Cost
                {order.materialCost > 0 && (
                  <span style={{ fontWeight: 700, color: T.text2, marginLeft: 6 }}>₹{order.materialCost.toLocaleString('en-IN')}</span>
                )}
              </span>
              <button
                onClick={() => { setMatFormOpen((v) => !v); setMatCostValue(order.materialCost ? String(order.materialCost) : ''); }}
                style={{ fontSize: 11, fontWeight: 600, color: T.muted, background: 'none', border: `1px solid ${T.border}`, borderRadius: T.r.sm, padding: '3px 8px', cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {order.materialCost > 0 ? 'Edit' : 'Add'}
              </button>
            </div>

            {matFormOpen && (
              <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Amount (₹)</div>
                  <input
                    type="number"
                    placeholder="0"
                    value={matCostValue}
                    onChange={(e) => setMatCostValue(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }}
                  />
                </div>
                <button
                  onClick={() => setMatFormOpen(false)}
                  style={{ padding: '8px 12px', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer', flexShrink: 0 }}
                >
                  Cancel
                </button>
                <button
                  disabled={updateMaterialCostMutation.isPending}
                  onClick={async () => {
                    await updateMaterialCostMutation.mutateAsync({ orderId: order.id, materialCost: Number(matCostValue) || 0, totalAmount: order.totalAmount });
                    setMatFormOpen(false);
                  }}
                  style={{ padding: '8px 14px', borderRadius: T.r.sm, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', flexShrink: 0 }}
                >
                  {updateMaterialCostMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}

            <div style={{ padding: matFormOpen ? '0 16px 10px' : '0 16px 10px', borderTop: `1px dashed ${T.border}`, margin: '0 16px', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBody }}>Profit</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: profit >= 0 ? T.success.text : T.danger.text, fontFamily: T.fontBody }}>
                ₹{profit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ textAlign: 'center', fontSize: 11, color: T.muted, paddingBottom: 4 }}>
          Created by {order.createdByName} · {format(order.createdAt, 'd MMM yyyy')}
        </div>
      </div>


      {/* ── Lightbox ── */}
      {lightboxIdx !== null && allImages[lightboxIdx] && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1400, background: 'rgba(0,0,0,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', paddingTop: 'max(20px, calc(env(safe-area-inset-top, 0px) + 12px))', paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 12px))' }}
        >
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + allImages.length) % allImages.length); }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % allImages.length); }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
          <img
            src={allImages[lightboxIdx].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          />
          {(allImages[lightboxIdx].note || allImages[lightboxIdx].itemName) && (
            <div style={{ marginTop: 14, textAlign: 'center', color: '#fff', fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ opacity: 0.5, fontSize: 11, marginBottom: 4 }}>{allImages[lightboxIdx].itemName}</div>
              {allImages[lightboxIdx].note && <div>{allImages[lightboxIdx].note}</div>}
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{lightboxIdx + 1} / {allImages.length}</div>
          <button
            onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: 'max(16px, calc(env(safe-area-inset-top, 0px) + 8px))', right: 16, width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </Drawer>
  );
}
