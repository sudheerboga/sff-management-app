import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase, AppTheme } from '@/theme/appTheme';
import { useOrders } from './hooks/useOrders';
import { useAuthStore } from '@/stores/authStore';
import { useBoutiqueCloudinary } from '@/hooks/useBoutiqueCloudinary';
import { uploadToCloudinary } from '@/utils/cloudinary';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CustomerMemberPicker from '@/components/common/CustomerMemberPicker';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
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

interface ItemLine { id: number; name: string; amount: string; images: ImageDraft[] }

const today = () => new Date().toISOString().split('T')[0];
const emptyLine = (): ItemLine => ({ id: Date.now() + Math.random(), name: '', amount: '', images: [] });

function initLines(order?: Partial<Order>): ItemLine[] {
  if (order?.items?.length)
    return order.items.map((i, idx) => ({
      id: Date.now() + idx,
      name: i.garment,
      amount: String(i.amount),
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

// Defined at module level — prevents remount on every parent render
interface FInputProps {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; prefix?: string; placeholder?: string; id: string;
  focusedId: string | null; onFocus: (id: string) => void; onBlur: () => void;
  T: AppTheme; isDark: boolean; labelColor: string;
}
function FInput({ label, value, onChange, type = 'text', prefix, placeholder, id, focusedId, onFocus, onBlur, T, isDark, labelColor }: FInputProps) {
  const foc = focusedId === id;
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: foc ? labelColor : T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody, transition: 'color .2s' }}>
        {label}
      </label>
      {prefix ? (
        <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${foc ? T.violet.d : T.border}`, borderRadius: T.r.md, background: foc ? T.inputFocusBg : T.inputBg, overflow: 'hidden', transition: 'all .2s', boxShadow: foc ? `0 0 0 3px ${isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.12)'}` : T.sh.inner }}>
          <span style={{ padding: '0 6px 0 12px', fontSize: 14, fontWeight: 700, color: T.muted }}>{prefix}</span>
          <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onFocus={() => onFocus(id)} onBlur={onBlur}
            style={{ flex: 1, padding: '13px 12px 13px 2px', border: 'none', outline: 'none', fontSize: 15, fontFamily: T.fontBody, background: 'transparent', color: T.text, WebkitTextFillColor: T.text, fontWeight: 600 }} />
        </div>
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onFocus={() => onFocus(id)} onBlur={onBlur} style={inputBase(foc, T)} />
      )}
    </div>
  );
}

export default function OrderFormPage() {
  const { T, isDark } = useAppTheme();
  const muiTheme  = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));
  const navigate  = useNavigate();
  const location  = useLocation();
  const { orderId } = useParams<{ orderId?: string }>();
  const isEdit = !!orderId;
  const user   = useAuthStore((s) => s.user);
  const { query, createMutation, updateMutation } = useOrders();
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

  const itemTotal = lines.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);
  const balance   = Math.max(0, itemTotal - (parseFloat(paid) || 0));
  const profit    = itemTotal - (parseFloat(material) || 0);

  function updateLine(id: number, field: 'name' | 'amount', val: string) {
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

  async function handleSave() {
    const errors: { phone?: string; name?: string } = {};
    if (!customerPick.customerName.trim()) errors.name = 'Customer name is required';
    if (setPickErrors) setPickErrors(errors);
    if (Object.keys(errors).length) return;

    const items: OrderItem[] = lines
      .filter((l) => l.name.trim() && parseFloat(l.amount) > 0)
      .map((l) => ({
        garment: l.name.trim(),
        description: '',
        qty: 1,
        rate: parseFloat(l.amount),
        amount: parseFloat(l.amount),
        profit: 0,
        images: l.images
          .filter((img) => img.url && !img.error)
          .map((img) => ({ url: img.url!, publicId: img.publicId || '', note: img.note })),
      }));
    if (!items.length) return;

    // Resolve customerId — create new customer if needed
    let resolvedCustomerId = customerPick.customerId;
    const pick = customerPick as CustomerPickResult & { _newMember?: CustomerMember };

    if (!resolvedCustomerId && customerPick.customerPhone) {
      // New customer
      resolvedCustomerId = await createCustomer.mutateAsync({
        name: customerPick.customerName,
        phone: customerPick.customerPhone,
        members: [{ id: Math.random().toString(36).slice(2), name: customerPick.customerName, relation: 'self' }],
      });
    } else if (resolvedCustomerId && pick._newMember) {
      // Existing customer with a brand-new family member
      await addMemberMutation.mutateAsync({ customerId: resolvedCustomerId, member: pick._newMember });
    }

    const data = {
      customerId:    resolvedCustomerId,
      memberName:    customerPick.memberName || customerPick.customerName,
      memberId:      customerPick.memberId,
      customerName:  customerPick.customerName,
      customerPhone: customerPick.customerPhone,
      items,
      paidAmount:   parseFloat(paid)     || 0,
      materialCost: parseFloat(material) || 0,
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
  }

  const sectionBg  = isDark ? 'rgba(26,21,48,0.6)' : T.bg;
  const secBorder  = isDark ? 'rgba(155,127,212,0.15)' : T.border;
  const labelColor = isDark ? T.gold.d : T.violet.d;

  const sec: React.CSSProperties = { background: sectionBg, borderRadius: T.r.lg, padding: '18px 18px 6px', marginBottom: 12, border: `1px solid ${secBorder}`, boxShadow: T.sh.xs, overflow: 'hidden' };
  const secHead: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };
  const fi = { focusedId, onFocus: setFocusedId, onBlur: () => setFocusedId(null), T, isDark, labelColor };

  const saveBarBottom = isDesktop ? 0 : 64;

  return (
    <div style={{ fontFamily: T.fontBody, paddingBottom: isDesktop ? 90 : 160 }}>

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
        <CustomerMemberPicker
          value={customerPick}
          onChange={(v) => { setCustomerPick(v); setPickErrors({}); }}
          customers={customersQuery.data || []}
          errors={pickErrors}
        />
        {/* member label shown when different from account holder */}
        {customerPick.memberName && customerPick.memberName !== customerPick.customerName && (
          <div style={{ marginTop: 10, marginBottom: 4, fontSize: 12, color: T.violet.d, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Order for: {customerPick.memberName}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 14, marginBottom: 14 }}>
          <div style={{ width: '80%' }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Order Date</label>
            <input type="date" value={orderDt} onChange={(e) => setOrderDt(e.target.value)} style={{ ...inputBase(false, T), colorScheme: isDark ? 'dark' : 'light', width: '100%'}} />
          </div>
          <div style={{ width: '80%' }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Delivery Date</label>
            <input type="date" value={delivDt} onChange={(e) => setDelivDt(e.target.value)} style={{ ...inputBase(false, T), colorScheme: isDark ? 'dark' : 'light', width: '100%' }} />
          </div>
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
      <div style={sec}>
        <div style={secHead}><div style={{ width: 14, height: 1, background: T.grad.brand, opacity: .6 }} />Payment Details</div>

        {/* Total amount — auto-calculated from items */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? 'rgba(155,127,212,0.1)' : '#f3eff9', border: `1.5px solid ${isDark ? 'rgba(155,127,212,0.25)' : T.violet.d + '33'}`, borderRadius: T.r.md, padding: '12px 16px', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.violet.d, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>Total Amount</div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontBody }}>Auto-calculated from items</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.violet.d, letterSpacing: '-.02em', fontFamily: T.fontBody }}>
            ₹{itemTotal.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <FInput label="Material Cost" value={material} onChange={setMaterial} type="number" prefix="₹" placeholder="0" id="material" {...fi} />
          <FInput label="Amount Given"  value={paid}     onChange={setPaid}     type="number" prefix="₹" placeholder="0" id="paid"     {...fi} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, background: isDark ? 'rgba(255,255,255,0.03)' : T.bg2, borderRadius: T.r.md, padding: '14px 15px', border: `1px solid ${T.border}`, marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Balance Due</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.danger.text, letterSpacing: '-.01em' }}>₹{balance.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Profit</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: profit >= 0 ? T.success.text : T.danger.text, letterSpacing: '-.01em' }}>₹{profit.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* ── Sticky Save bar ── */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: saveBarBottom,
        padding: '12px 20px',
        background: isDark ? 'rgba(13,10,24,0.96)' : 'rgba(253,250,247,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.border}`,
        zIndex: 50,
        paddingBottom: '2rem'
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
