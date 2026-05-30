import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase } from '@/theme/appTheme';
import DateInput from '@/components/common/DateInput';
import { useOrders } from './hooks/useOrders';
import { useAuthStore } from '@/stores/authStore';
import { useBoutiqueCloudinary } from '@/hooks/useBoutiqueCloudinary';
import { uploadToCloudinary } from '@/utils/cloudinary';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CustomerMemberPicker from '@/components/common/CustomerMemberPicker';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { Order, OrderItem, CustomerPickResult, CustomerMember } from '@/types';

interface ImageDraft {
  id: string;
  file?: File;
  localPreview?: string;
  url?: string;
  publicId?: string;
  note: string;
  uploading: boolean;
  error: boolean;
}

interface ItemLine { id: number; name: string; amount: string; note: string; images: ImageDraft[] }

const today = () => new Date().toISOString().split('T')[0];
const emptyLine = (): ItemLine => ({ id: Date.now() + Math.random(), name: '', amount: '', note: '', images: [] });

function initLines(order?: Partial<Order>): ItemLine[] {
  if (order?.items?.length)
    return order.items.map((i, idx) => ({
      id: Date.now() + idx,
      name: i.garment,
      amount: String(i.amount),
      note: i.description || '',
      images: (i.images || []).map((img) => ({
        id: Math.random().toString(36).slice(2),
        url: img.url,
        publicId: img.publicId,
        note: img.note,
        uploading: false,
        error: false,
      })),
    }));
  return [emptyLine()];
}



export default function OrderFormPage() {
  const { T, isDark } = useAppTheme();
  const muiTheme  = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));
  const navigate  = useNavigate();
  const { isReadOnly } = usePlanStatus();
  useEffect(() => { if (isReadOnly) navigate('/dashboard', { replace: true }); }, [isReadOnly, navigate]);
  const location  = useLocation();
  const { orderId } = useParams<{ orderId?: string }>();
  const isEdit = !!orderId;
  const user   = useAuthStore((s) => s.user);
  const { query, createMutation, updateMutation, addPaymentMutation, updateMaterialCostMutation } = useOrders();
  const { query: customersQuery, createMutation: createCustomer, addMemberMutation } = useCustomers();
  const cloudinaryConfig = useBoutiqueCloudinary();

  const defaultValues: Partial<Order> | undefined =
    (location.state as { order?: Order })?.order ??
    (orderId ? query.data?.find((o) => o.id === orderId) : undefined);

  const prefillPhone = (location.state as { prefillPhone?: string })?.prefillPhone || '';

  const [customerPick, setCustomerPick] = useState<CustomerPickResult>({
    customerId:   defaultValues?.customerId   || '',
    customerName: defaultValues?.customerName || '',
    customerPhone: defaultValues?.customerPhone || prefillPhone,
    memberName:   defaultValues?.memberName   || defaultValues?.customerName || '',
    memberId:     defaultValues?.memberId,
  });
  const [orderDt,   setOrderDt]   = useState(defaultValues?.orderDate    ? new Date(defaultValues.orderDate).toISOString().split('T')[0]    : today());
  const [delivDt,   setDelivDt]   = useState(defaultValues?.deliveryDate ? new Date(defaultValues.deliveryDate).toISOString().split('T')[0] : '');
  const [material,  setMaterial]  = useState(defaultValues?.materialCost ? String(defaultValues.materialCost) : '');
  const [paid,      setPaid]      = useState(defaultValues?.paidAmount   ? String(defaultValues.paidAmount)   : '');
  const [notes,     setNotes]     = useState(defaultValues?.notes || '');
  const [lines,     setLines]     = useState<ItemLine[]>(() => initLines(defaultValues));
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pickErrors, setPickErrors] = useState<{ phone?: string; name?: string }>({});
  const [payFormOpen,  setPayFormOpen]  = useState(false);
  const [payAmount,    setPayAmount]    = useState('');
  const [payDate,      setPayDate]      = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [payNote,      setPayNote]      = useState('');
  const [matFormOpen,  setMatFormOpen]  = useState(false);
  const [matCostValue, setMatCostValue] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPAmt,  setEditPAmt]  = useState('');
  const [editPDate, setEditPDate] = useState('');
  const [editPNote, setEditPNote] = useState('');
  const [localMaterialCost, setLocalMaterialCost] = useState<number>(defaultValues?.materialCost ?? 0);
  const savedRef = useRef(false);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      lines.forEach((l) => l.images.forEach((img) => { if (img.localPreview) URL.revokeObjectURL(img.localPreview); }));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (defaultValues && isEdit) {
      setCustomerPick({
        customerId:    defaultValues.customerId   || '',
        customerName:  defaultValues.customerName || '',
        customerPhone: defaultValues.customerPhone || '',
        memberName:    defaultValues.memberName   || defaultValues.customerName || '',
        memberId:      defaultValues.memberId,
      });
      setOrderDt(defaultValues.orderDate    ? new Date(defaultValues.orderDate).toISOString().split('T')[0]    : today());
      setDelivDt(defaultValues.deliveryDate ? new Date(defaultValues.deliveryDate).toISOString().split('T')[0] : '');
      setMaterial(defaultValues.materialCost ? String(defaultValues.materialCost) : '');
      setPaid(defaultValues.paidAmount       ? String(defaultValues.paidAmount)   : '');
      setLocalMaterialCost(defaultValues.materialCost ?? 0);
      setNotes(defaultValues.notes || '');
      setLines(initLines(defaultValues));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id]);

  // Detect unsaved changes
  const isDirty = useMemo(() => {
    if (isEdit) {
      return (
        customerPick.customerName  !== (defaultValues?.customerName  || '') ||
        customerPick.customerPhone !== (defaultValues?.customerPhone || '') ||
        material !== (defaultValues?.materialCost?.toString() || '0') ||
        paid     !== (defaultValues?.paidAmount?.toString()   || '0') ||
        notes    !== (defaultValues?.notes || '') ||
        lines.length !== (defaultValues?.items?.length || 1)
      );
    }
    return customerPick.customerName.trim().length > 0 || customerPick.customerPhone.length > 0 || lines.some((l) => l.name || l.amount !== '');
  }, [isEdit, customerPick, material, paid, notes, lines, defaultValues]);

  const blocker = useBlocker(() => !savedRef.current && isDirty);

  const currentOrder = isEdit ? (query.data?.find((o) => o.id === orderId) ?? defaultValues as Order | undefined) : undefined;

  const itemTotal        = lines.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);
  const editPaidAmount   = isEdit ? (currentOrder?.paidAmount   || 0) : (parseFloat(paid)     || 0);
  const editMaterialCost = isEdit ? localMaterialCost                 : (parseFloat(material) || 0);
  const balance          = Math.max(0, itemTotal - editPaidAmount);
  const profit           = itemTotal - editMaterialCost;

  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(() => {
    const s = new Set<number>();
    return s;
  });

  function toggleNote(id: number) {
    setExpandedNotes((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function updateLine(id: number, field: 'name' | 'amount' | 'note', val: string) {
    setLines((prev) => prev.map((l) => l.id === id ? { ...l, [field]: val } : l));
  }
  function addLine()          { setLines((prev) => [...prev, emptyLine()]); }
  function removeLine(id: number) {
    setLines((prev) => { const next = prev.filter((l) => l.id !== id); return next.length ? next : [emptyLine()]; });
  }

  const addImages = useCallback(async (lineId: number, files: FileList) => {
    if (!cloudinaryConfig) return;
    const drafts: ImageDraft[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      localPreview: URL.createObjectURL(f),
      note: '',
      uploading: true,
      error: false,
    }));
    setLines((prev) => prev.map((l) => l.id === lineId ? { ...l, images: [...l.images, ...drafts] } : l));

    for (const draft of drafts) {
      try {
        const result = await uploadToCloudinary(draft.file!, cloudinaryConfig);
        setLines((prev) => prev.map((l) =>
          l.id === lineId
            ? { ...l, images: l.images.map((img) => img.id === draft.id ? { ...img, url: result.url, publicId: result.publicId, uploading: false } : img) }
            : l,
        ));
      } catch {
        setLines((prev) => prev.map((l) =>
          l.id === lineId
            ? { ...l, images: l.images.map((img) => img.id === draft.id ? { ...img, uploading: false, error: true } : img) }
            : l,
        ));
      }
    }
  }, [cloudinaryConfig]);

  function updateImageNote(lineId: number, imgId: string, note: string) {
    setLines((prev) => prev.map((l) =>
      l.id === lineId ? { ...l, images: l.images.map((img) => img.id === imgId ? { ...img, note } : img) } : l,
    ));
  }

  function removeImage(lineId: number, imgId: string) {
    setLines((prev) => prev.map((l) =>
      l.id === lineId ? { ...l, images: l.images.filter((img) => img.id !== imgId) } : l,
    ));
  }

  const loading = createMutation.isPending || updateMutation.isPending;
  const submittingRef = useRef(false);

  async function handleSave() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const errors: { phone?: string; name?: string } = {};
    if (!customerPick.customerName.trim()) errors.name = 'Customer name is required';
    if (setPickErrors) setPickErrors(errors);
    if (Object.keys(errors).length) { submittingRef.current = false; return; }

    try {
      const items: OrderItem[] = lines
        .filter((l) => l.name.trim() && parseFloat(l.amount) > 0)
        .map((l) => ({
          garment: l.name.trim(),
          description: l.note.trim(),
          qty: 1,
          rate: parseFloat(l.amount),
          amount: parseFloat(l.amount),
          profit: 0,
          images: l.images
            .filter((img) => img.url && !img.error)
            .map((img) => ({ url: img.url!, publicId: img.publicId || '', note: img.note })),
        }));
      if (!items.length) { submittingRef.current = false; return; }

      let resolvedCustomerId = customerPick.customerId;
      const pick = customerPick as CustomerPickResult & { _newMember?: CustomerMember };

      if (!resolvedCustomerId && customerPick.customerPhone) {
        resolvedCustomerId = await createCustomer.mutateAsync({
          name: customerPick.customerName,
          phone: customerPick.customerPhone,
          members: [{ id: Math.random().toString(36).slice(2), name: customerPick.customerName, relation: 'self' }],
        });
      } else if (resolvedCustomerId && pick._newMember) {
        await addMemberMutation.mutateAsync({ customerId: resolvedCustomerId, member: pick._newMember });
      }

      const data = {
        customerId:    resolvedCustomerId,
        memberName:    customerPick.memberName || customerPick.customerName,
        memberId:      customerPick.memberId,
        customerName:  customerPick.customerName,
        customerPhone: customerPick.customerPhone,
        items,
        paidAmount:   isEdit ? (currentOrder?.paidAmount ?? 0) : (parseFloat(paid) || 0),
        materialCost: isEdit ? localMaterialCost             : (parseFloat(material) || 0),
        deliveryDate: delivDt ? new Date(delivDt) : null,
        orderDate:    new Date(orderDt || today()),
        notes,
      };
      if (isEdit && orderId) {
        await updateMutation.mutateAsync({ orderId, data });
      } else {
        await createMutation.mutateAsync({ ...data, createdBy: user!.uid, createdByName: user!.name });
      }
      savedRef.current = true;
      navigate(-1);
    } finally {
      submittingRef.current = false;
    }
  }

  const sectionBg  = isDark ? 'rgba(26,21,48,0.6)' : T.bg;
  const secBorder  = isDark ? 'rgba(155,127,212,0.15)' : T.border;
  const labelColor = isDark ? T.gold.d : T.violet.d;

  const sec: React.CSSProperties = { background: sectionBg, borderRadius: T.r.lg, padding: '18px 18px 6px', marginBottom: 12, border: `1px solid ${secBorder}`, boxShadow: T.sh.xs, overflow: 'hidden' };
  const secHead: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };
  const fi = { focusedId, onFocus: setFocusedId, onBlur: () => setFocusedId(null), labelColor };

  const saveBarBottom = isDesktop ? 0 : 'calc(64px + env(safe-area-inset-bottom, 0px))';

  return (
    <div style={{ fontFamily: T.fontBody, paddingBottom: isDesktop ? 90 : 'calc(160px + env(safe-area-inset-bottom, 0px))', overflowX: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, flexShrink: 0 }}
          aria-label="Back">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay }}>
            {isEdit ? 'Edit Order' : 'New Order'}
          </div>
          {defaultValues?.orderNumber && (
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1, fontFamily: 'monospace' }}>#{defaultValues.orderNumber}</div>
          )}
        </div>
      </div>

      {/* ── Customer ── */}
      <div style={sec}>
        <div style={secHead}><div style={{ width: 14, height: 1, background: T.grad.brand, opacity: .6 }} />Customer Details</div>
        {isEdit ? (
          /* Edit mode: read-only — no member switching */
          <div style={{
            padding: '12px 16px',
            background: isDark ? 'rgba(123,94,167,0.1)' : T.violet.pale,
            border: `1.5px solid ${T.violet.d}33`,
            borderRadius: T.r.md,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.grad.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>
                {customerPick.memberName && customerPick.memberName !== customerPick.customerName
                  ? customerPick.memberName
                  : customerPick.customerName}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                {customerPick.memberName && customerPick.memberName !== customerPick.customerName
                  ? `${customerPick.customerName} · ${customerPick.customerPhone}`
                  : customerPick.customerPhone}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.violet.d, background: isDark ? 'rgba(123,94,167,0.2)' : `${T.violet.d}18`, padding: '3px 10px', borderRadius: T.r.pill }}>
              Editing
            </span>
          </div>
        ) : (
          <>
            <CustomerMemberPicker
              value={customerPick}
              onChange={(v) => { setCustomerPick(v); setPickErrors({}); }}
              customers={customersQuery.data || []}
              errors={pickErrors}
            />
            {customerPick.memberName && customerPick.memberName !== customerPick.customerName && (
              <div style={{ marginTop: 10, marginBottom: 4, fontSize: 12, color: T.violet.d, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Order for: {customerPick.memberName}
              </div>
            )}
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 14, marginBottom: 14 }}>
          <DateInput label="Order Date"    value={orderDt} onChange={setOrderDt} id="orderDt"  {...fi} />
          <DateInput label="Delivery Date" value={delivDt} onChange={setDelivDt} id="delivDt"  {...fi} />
        </div>
      </div>

      {/* ── Items ── */}
      <div style={sec}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={secHead}><div style={{ width: 14, height: 1, background: T.grad.brand, opacity: .6 }} />Item-wise Amounts</div>
          {itemTotal > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: T.violet.d, background: isDark ? 'rgba(155,127,212,0.15)' : '#f3eff9', padding: '3px 10px', borderRadius: T.r.pill, border: `1px solid ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '33'}`, whiteSpace: 'nowrap' }}>
              ₹{itemTotal.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 10 }}>
          {lines.map((line, idx) => (
            <div key={line.id}>
              {/* Item row */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={line.name} onChange={(e) => updateLine(line.id, 'name', e.target.value)} placeholder={`Item ${idx + 1} e.g. Blouse`}
                  style={{ flex: 2, minWidth: 0, ...inputBase(false, T), marginBottom: 0, fontSize: 13, padding: '10px 12px' }} />
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, border: `1.5px solid ${T.border}`, borderRadius: T.r.md, background: isDark ? 'rgba(255,255,255,0.03)' : T.bg, overflow: 'hidden' }}>
                  <span style={{ padding: '0 6px 0 10px', fontSize: 13, fontWeight: 700, color: T.muted }}>₹</span>
                  <input type="number" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', e.target.value)} placeholder="0"
                    style={{ flex: 1, minWidth: 0, padding: '10px 8px 10px 2px', border: 'none', fontSize: 14, fontFamily: T.fontBody, background: 'transparent', color: T.text, outline: 'none', WebkitTextFillColor: T.text, fontWeight: 700 }} />
                </div>
                {lines.length > 1 && (
                  <button onClick={() => removeLine(line.id)} style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(248,113,113,0.12)' : '#fdeaea', border: 'none', borderRadius: T.r.sm, cursor: 'pointer', color: T.danger.text, fontSize: 14 }}>✕</button>
                )}
              </div>

              {/* Per-item note — shown on demand */}
              {(expandedNotes.has(line.id) || line.note.trim().length > 0) ? (
                <div style={{ marginTop: 6, position: 'relative' }}>
                  <textarea
                    autoFocus={expandedNotes.has(line.id) && line.note.trim().length === 0}
                    value={line.note}
                    onChange={(e) => updateLine(line.id, 'note', e.target.value)}
                    placeholder="Item note — e.g. sleeve style, embroidery detail…"
                    rows={2}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'none', fontSize: 12, lineHeight: 1.5, padding: '7px 32px 7px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: isDark ? 'rgba(255,255,255,0.03)' : '#fffdf9', color: T.text, fontFamily: T.fontBody, outline: 'none', WebkitTextFillColor: T.text }}
                  />
                  {line.note.trim().length === 0 && (
                    <button
                      onClick={() => toggleNote(line.id)}
                      style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, border: 'none', background: 'none', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      title="Remove note"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => toggleNote(line.id)}
                  style={{ marginTop: 5, background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: T.muted, fontFamily: T.fontBody, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add note
                </button>
              )}

              {/* Image grid (only shown when Cloudinary is configured) */}
              {cloudinaryConfig && (
                <div style={{ marginTop: 10 }}>
                  {line.images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
                      {line.images.map((img) => (
                        <div key={img.id} style={{ border: `1.5px solid ${img.error ? T.danger.border : T.border}`, borderRadius: T.r.md, overflow: 'hidden', background: T.bg2 }}>
                          {/* Thumbnail */}
                          <div style={{ position: 'relative', aspectRatio: '4/3', background: isDark ? 'rgba(255,255,255,0.04)' : '#f0eef5' }}>
                            {(img.localPreview || img.url) && (
                              <img src={img.localPreview || img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: img.uploading ? 0.45 : 1, display: 'block' }} />
                            )}
                            {img.uploading && (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                                  </path>
                                </svg>
                              </div>
                            )}
                            {img.error && (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', fontSize: 22, gap: 4 }}>
                                ⚠️
                                <span style={{ fontSize: 10, color: T.danger.text, fontFamily: T.fontBody }}>Upload failed</span>
                              </div>
                            )}
                            <button
                              onClick={() => removeImage(line.id, img.id)}
                              style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, lineHeight: 1, backdropFilter: 'blur(4px)' }}
                            >✕</button>
                          </div>
                          {/* Note */}
                          <div style={{ padding: '7px 9px' }}>
                            <textarea
                              value={img.note}
                              onChange={(e) => updateImageNote(line.id, img.id, e.target.value)}
                              placeholder="Add note (e.g. sleeve detail, colour ref…)"
                              rows={2}
                              style={{ width: '100%', boxSizing: 'border-box', resize: 'none', fontSize: 12, lineHeight: 1.5, padding: '6px 8px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontFamily: T.fontBody, outline: 'none', WebkitTextFillColor: T.text }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.text2, cursor: 'pointer', padding: '8px 14px', border: `1.5px dashed ${T.border}`, borderRadius: T.r.sm, background: 'none' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {line.images.length > 0 ? 'Add more photos' : 'Add Photos'}
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.length) addImages(line.id, e.target.files); e.target.value = ''; }} />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={addLine} style={{ width: '100%', padding: '10px 0', background: isDark ? 'linear-gradient(135deg,rgba(155,127,212,0.06),rgba(201,107,154,0.04))' : 'linear-gradient(135deg,#f3eff9,#fdf0f6)', border: `1.5px dashed ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '55'}`, borderRadius: T.r.md, color: T.violet.d, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>+</span> Add Item
        </button>
        <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Additional Info (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fabric notes, fitting instructions…" rows={3}
          style={{ ...inputBase(false, T), resize: 'vertical', lineHeight: 1.5, marginBottom: 4 }} />
      </div>

      {/* ── Payment ── */}
      <div style={{...sec, padding: '18px'}}>
        <div style={secHead}><div style={{ width: 14, height: 1, background: T.grad.brand, opacity: .6 }} />Payment Details</div>

        <div style={{ borderRadius: T.r.md, border: `1px solid ${T.border}`, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'white', overflow: 'hidden' }}>

          {/* Total Bill + Balance Due */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '14px 16px', borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Total Bill</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: T.fontBody, lineHeight: 1 }}>
                ₹{itemTotal.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: balance > 0 ? `${T.danger.text}12` : `${T.success.text}12` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: balance > 0 ? T.danger.text : T.success.text, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                {balance > 0 ? 'Balance Due' : 'Fully Paid'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: balance > 0 ? T.danger.text : T.success.text, fontFamily: T.fontBody, lineHeight: 1 }}>
                ₹{balance > 0 ? balance.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {itemTotal > 0 && (
            <div style={{ padding: '10px 16px 0', borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBody }}>Paid ₹{editPaidAmount.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.success.text, fontFamily: T.fontBody }}>
                  {Math.round((editPaidAmount / itemTotal) * 100)}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: T.border, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 3, background: T.success.text, width: `${Math.min(100, Math.round((editPaidAmount / itemTotal) * 100))}%`, transition: 'width .3s ease' }} />
              </div>
            </div>
          )}

          {/* Payment history + Add Payment (edit mode) */}
          {isEdit && currentOrder && (
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: (currentOrder.payments?.length ?? 0) > 0 ? 12 : 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Payment History</span>
                <button
                  onClick={() => { setPayFormOpen((v) => !v); setPayAmount(''); setPayDate(format(new Date(), 'yyyy-MM-dd')); setPayNote(''); }}
                  style={{ fontSize: 12, fontWeight: 700, color: T.violet.d, background: `${T.violet.d}14`, border: `1px solid ${T.violet.d}33`, borderRadius: T.r.sm, padding: '4px 10px', cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Payment
                </button>
              </div>

              {currentOrder.payments && currentOrder.payments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {currentOrder.payments.map((p, i) => (
                    <div key={p.id}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.success.text, border: `2px solid ${T.success.text}33`, flexShrink: 0 }} />
                          {i < (currentOrder.payments?.length ?? 0) - 1 && (
                            <div style={{ width: 2, height: editingPaymentId === p.id ? 4 : 28, background: T.border, borderRadius: 1 }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingBottom: i < (currentOrder.payments?.length ?? 0) - 1 ? 4 : 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.success.text, fontFamily: T.fontBody }}>₹{p.amount.toLocaleString('en-IN')}</span>
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
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignSelf: 'center' }}>
                          <button
                            onClick={() => { setEditingPaymentId(p.id); setEditPAmt(String(p.amount)); setEditPDate(format(p.date, 'yyyy-MM-dd')); setEditPNote(p.note || ''); }}
                            style={{ width: 26, height: 26, borderRadius: T.r.sm, border: `1px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2 }}
                          >
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => {
                              const updated = (currentOrder.payments || []).filter((x) => x.id !== p.id);
                              addPaymentMutation.mutate({ orderId: currentOrder.id, payments: updated, totalAmount: itemTotal });
                            }}
                            style={{ width: 26, height: 26, borderRadius: T.r.sm, border: `1px solid ${T.danger.border}`, background: T.danger.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger.text }}
                          >
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          </button>
                        </div>
                      </div>
                      {editingPaymentId === p.id && (
                        <div style={{ marginLeft: 20, marginTop: 6, marginBottom: 8, padding: '10px 12px', background: isDark ? 'rgba(255,255,255,0.03)' : T.bg2, borderRadius: T.r.sm, border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Amount (₹)</div>
                              <input type="number" value={editPAmt} onChange={(e) => setEditPAmt(e.target.value)} style={{ width: '100%', padding: '7px 9px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <DateInput label="Date" value={editPDate} onChange={setEditPDate} />
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Note (optional)</div>
                            <input type="text" value={editPNote} onChange={(e) => setEditPNote(e.target.value)} style={{ width: '100%', padding: '7px 9px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 13, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }} />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setEditingPaymentId(null)} style={{ flex: 1, padding: '7px 0', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', color: T.text2, fontSize: 12, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer' }}>Cancel</button>
                            <button
                              disabled={!editPAmt || Number(editPAmt) <= 0 || addPaymentMutation.isPending}
                              onClick={async () => {
                                const updated = (currentOrder.payments || []).map((x) =>
                                  x.id === p.id ? { ...x, amount: Number(editPAmt), date: new Date(editPDate), note: editPNote.trim() } : x,
                                );
                                await addPaymentMutation.mutateAsync({ orderId: currentOrder.id, payments: updated, totalAmount: itemTotal });
                                setEditingPaymentId(null);
                              }}
                              style={{ flex: 2, padding: '7px 0', borderRadius: T.r.sm, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', opacity: (!editPAmt || Number(editPAmt) <= 0) ? 0.5 : 1 }}
                            >
                              {addPaymentMutation.isPending ? 'Saving…' : 'Update'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !payFormOpen && <div style={{ fontSize: 12, color: T.muted, textAlign: 'center', padding: '8px 0', fontStyle: 'italic' }}>No payments recorded yet</div>
              )}

              {payFormOpen && (
                <div style={{ marginTop: (currentOrder.payments?.length ?? 0) > 0 ? 12 : 0, borderTop: (currentOrder.payments?.length ?? 0) > 0 ? `1px solid ${T.border}` : 'none', paddingTop: (currentOrder.payments?.length ?? 0) > 0 ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Amount (₹)</div>
                      <input type="number" placeholder="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <DateInput label="Date" value={payDate} onChange={setPayDate} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Note (optional)</div>
                    <input type="text" placeholder="e.g. Advance, Final payment…" value={payNote} onChange={(e) => setPayNote(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setPayFormOpen(false)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button
                      disabled={!payAmount || Number(payAmount) <= 0 || addPaymentMutation.isPending}
                      onClick={async () => {
                        if (!currentOrder) return;
                        const entry = { id: Date.now().toString(36), amount: Number(payAmount), date: new Date(payDate), note: payNote.trim(), recordedBy: user?.name || '', recordedById: user?.uid || '', recordedByRole: user?.role || 'admin' };
                        const updated = [...(currentOrder.payments || []), entry];
                        await addPaymentMutation.mutateAsync({ orderId: currentOrder.id, payments: updated, totalAmount: itemTotal });
                        setPayFormOpen(false);
                      }}
                      style={{ flex: 2, padding: '9px 0', borderRadius: T.r.sm, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', opacity: (!payAmount || Number(payAmount) <= 0) ? 0.5 : 1 }}>
                      {addPaymentMutation.isPending ? 'Saving…' : 'Save Payment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New mode: initial payment input */}
          {!isEdit && (
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Advance Payment (optional)</div>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${T.border}`, borderRadius: T.r.md, background: T.inputBg, overflow: 'hidden' }}>
                <span style={{ padding: '0 6px 0 12px', fontSize: 14, fontWeight: 700, color: T.muted }}>₹</span>
                <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="0"
                  style={{ flex: 1, padding: '12px 12px 12px 2px', border: 'none', outline: 'none', fontSize: 15, fontFamily: T.fontBody, background: 'transparent', color: T.text, WebkitTextFillColor: T.text, fontWeight: 600 }} />
              </div>
            </div>
          )}

          {/* Material Cost + Profit */}
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            {isEdit && currentOrder ? (
              <>
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBody }}>
                    Material Cost
                    {localMaterialCost > 0 && (
                      <span style={{ fontWeight: 700, color: T.text2, marginLeft: 6 }}>₹{localMaterialCost.toLocaleString('en-IN')}</span>
                    )}
                  </span>
                  <button
                    onClick={() => { setMatFormOpen((v) => !v); setMatCostValue(localMaterialCost ? String(localMaterialCost) : ''); }}
                    style={{ fontSize: 11, fontWeight: 600, color: T.muted, background: 'none', border: `1px solid ${T.border}`, borderRadius: T.r.sm, padding: '3px 8px', cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    {localMaterialCost > 0 ? 'Edit' : 'Add'}
                  </button>
                </div>
                {matFormOpen && (
                  <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Amount (₹)</div>
                      <input type="number" placeholder="0" value={matCostValue} onChange={(e) => setMatCostValue(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }} />
                    </div>
                    <button onClick={() => setMatFormOpen(false)}
                      style={{ padding: '8px 12px', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer', flexShrink: 0 }}>
                      Cancel
                    </button>
                    <button
                      disabled={updateMaterialCostMutation.isPending}
                      onClick={async () => {
                        if (!currentOrder) return;
                        const newCost = Number(matCostValue) || 0;
                        await updateMaterialCostMutation.mutateAsync({ orderId: currentOrder.id, materialCost: newCost, totalAmount: itemTotal });
                        setLocalMaterialCost(newCost);
                        setMatFormOpen(false);
                      }}
                      style={{ padding: '8px 14px', borderRadius: T.r.sm, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', flexShrink: 0 }}>
                      {updateMaterialCostMutation.isPending ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                )}
              </>
            ) : !isEdit && (
              <div style={{ padding: '10px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Material Cost</div>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${T.border}`, borderRadius: T.r.md, background: T.inputBg, overflow: 'hidden' }}>
                  <span style={{ padding: '0 6px 0 12px', fontSize: 14, fontWeight: 700, color: T.muted }}>₹</span>
                  <input type="number" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="0"
                    style={{ flex: 1, padding: '12px 12px 12px 2px', border: 'none', outline: 'none', fontSize: 15, fontFamily: T.fontBody, background: 'transparent', color: T.text, WebkitTextFillColor: T.text, fontWeight: 600 }} />
                </div>
              </div>
            )}
            <div style={{ borderTop: `1px dashed ${T.border}`, margin: '0 16px', paddingTop: 8, paddingBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBody }}>Profit</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: profit >= 0 ? T.success.text : T.danger.text, fontFamily: T.fontBody }}>
                ₹{profit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky Save bar ── */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: saveBarBottom,
        padding: '12px 16px 2rem',
        background: isDark ? 'rgba(13,10,24,0.96)' : 'rgba(253,250,247,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.border}`,
        zIndex: 50,
      }}>
        <button onClick={handleSave} disabled={loading || !customerPick.customerName.trim()}
          style={{
            width: '100%', maxWidth: 600, display: 'block', margin: '0 auto',
            padding: '15px 0', border: 'none', borderRadius: T.r.md,
            background: (loading || !customerPick.customerName.trim()) ? (isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand,
            color: (loading || !customerPick.customerName.trim()) ? T.muted : '#fff',
            fontSize: 15, fontFamily: T.fontBody, fontWeight: 700,
            cursor: (loading || !customerPick.customerName.trim()) ? 'not-allowed' : 'pointer',
            letterSpacing: '.02em',
            boxShadow: (loading || !customerPick.customerName.trim()) ? 'none' : T.sh.brand,
            opacity: (loading || !customerPick.customerName.trim()) ? .5 : 1,
            transition: 'all .2s',
          }}>
          {loading ? 'Saving…' : isEdit ? 'Update Order' : '+ Save Order'}
        </button>
      </div>

      {/* ── Unsaved changes guard ── */}
      {blocker.state === 'blocked' && (
        <ConfirmDialog
          open
          title="Discard changes?"
          message="You have unsaved changes. Are you sure you want to leave?"
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          confirmColor="error"
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
}
