import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/stores/authStore';
import { useMeasurements } from './hooks/useMeasurements';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Measurement } from '@/types';
import { buildMeasurementMessage, shareMeasurementWhatsApp } from '@/utils/whatsapp';

export default function MeasurementViewPage() {
  const { T, isDark } = useAppTheme();
  const navigate      = useNavigate();
  const location      = useLocation();
  const { measurementId } = useParams<{ measurementId: string }>();
  const user    = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';
  const { query, deleteMutation } = useMeasurements();

  const measurement: Measurement | undefined =
    (location.state as { measurement?: Measurement })?.measurement ??
    query.data?.find((m) => m.id === measurementId);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied,     setCopied]     = useState(false);

  if (!measurement) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: T.muted, fontFamily: T.fontBody }}>
        Measurement not found.
        <br />
        <button onClick={() => navigate('/measurements')} style={{ marginTop: 12, background: 'none', border: 'none', color: T.violet.d, cursor: 'pointer', fontFamily: T.fontBody, fontSize: 14 }}>
          ← Back to measurements
        </button>
      </div>
    );
  }

  const forSelf = !measurement.memberName || measurement.memberName === measurement.customerName;
  const labelColor = isDark ? T.gold.d : T.violet.d;
  const cardBg     = isDark ? 'rgba(26,21,48,0.6)' : T.card;
  const rowBg      = isDark ? 'rgba(255,255,255,0.03)' : T.bg2;

  async function handleDelete() {
    if (!measurement) return;
    await deleteMutation.mutateAsync(measurement.id);
    navigate('/measurements', { replace: true });
  }

  function handleCopy() {
    if (!measurement) return;
    const text = buildMeasurementMessage(measurement);
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ fontFamily: T.fontBody, paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, flexShrink: 0 }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay, lineHeight: 1.2 }}>
            {forSelf ? measurement.customerName : measurement.memberName}
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {forSelf ? 'Measurements' : `Measurements · ${measurement.customerName}`}
          </div>
        </div>
        {!isStaff && (
          <button
            onClick={() => navigate(`/measurements/edit/${measurement.id}`, { state: { measurement } })}
            style={{ padding: '8px 16px', borderRadius: T.r.md, border: `1.5px solid ${T.violet.d}`, background: 'transparent', color: T.violet.d, fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        )}
      </div>

      {/* ── Customer info card ── */}
      <div style={{ background: cardBg, border: `1px solid ${T.border}`, borderRadius: T.r.lg, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.grad.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
            {measurement.customerName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{measurement.customerName}</div>
            {measurement.customerPhone && (
              <div style={{ fontSize: 12, color: T.muted }}>+91 {measurement.customerPhone}</div>
            )}
          </div>
          {!forSelf && (
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: T.r.pill, background: isDark ? 'rgba(123,94,167,0.15)' : T.violet.pale, color: T.violet.d, border: `1px solid ${T.violet.d}33` }}>
              For {measurement.memberName}
            </span>
          )}
        </div>
      </div>

      {/* ── Garments ── */}
      {Object.entries(measurement.garments).map(([garment, fields]) => {
        const filledFields = Object.entries(fields).filter(([, v]) => v);
        if (!filledFields.length) return null;
        return (
          <div key={garment} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6 }} />
              {garment}
              <span style={{ fontSize: 10, fontWeight: 500, color: T.muted, textTransform: 'none', letterSpacing: 0 }}>
                ({filledFields.length} fields)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
              {filledFields.map(([field, val]) => (
                <div
                  key={field}
                  style={{
                    background: isDark ? 'rgba(155,127,212,0.08)' : T.violet.pale,
                    border: `1.5px solid ${isDark ? 'rgba(155,127,212,0.2)' : T.violet.d + '22'}`,
                    borderRadius: T.r.lg,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{field}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: T.violet.d, fontFamily: T.fontBody, lineHeight: 1 }}>{val}<span style={{ fontSize: 12, fontWeight: 500, color: T.muted, marginLeft: 2 }}>in</span></div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Notes ── */}
      {measurement.notes && (
        <div style={{ background: rowBg, border: `1px solid ${T.border}`, borderRadius: T.r.md, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Notes</div>
          <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.6, fontStyle: 'italic' }}>{measurement.notes}</p>
        </div>
      )}

      {/* ── Meta ── */}
      <div style={{ textAlign: 'center', fontSize: 11, color: T.muted, marginBottom: 24 }}>
        Last updated {format(measurement.updatedAt, 'd MMM yyyy')}
      </div>

      {/* ── Action bar ── */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 64,
        padding: '12px 16px',
        background: isDark ? 'rgba(13,10,24,0.96)' : 'rgba(253,250,247,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.border}`,
        zIndex: 50,
        paddingBottom: '2rem',
      }}>
        <div style={{ display: 'flex', gap: 8, maxWidth: 600, margin: '0 auto' }}>
          {/* Copy */}
          <button
            onClick={handleCopy}
            style={{ flex: 1, padding: '11px 0', borderRadius: T.r.md, border: `1.5px solid ${T.border}`, background: copied ? T.success.bg : 'transparent', color: copied ? T.success.text : T.text2, fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .2s' }}
          >
            {copied
              ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
              : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy</>
            }
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => measurement && shareMeasurementWhatsApp(measurement)}
            style={{ flex: 1, padding: '11px 0', borderRadius: T.r.md, border: 'none', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(37,211,102,.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.136 1.535 5.875L0 24l6.306-1.504A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-4.964-1.346l-.356-.212-3.741.892.945-3.617-.232-.373A9.79 9.79 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818s9.818 4.397 9.818 9.818-4.397 9.818-9.818 9.818z"/></svg>
            WhatsApp
          </button>

          {/* Edit */}
          {/* {!isStaff && (
            <button
              onClick={() => navigate(`/measurements/edit/${measurement.id}`, { state: { measurement } })}
              style={{ flex: 1, padding: '11px 0', borderRadius: T.r.md, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: T.sh.brand }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
          )} */}

          {/* Delete */}
          {!isStaff && (
            <button
              onClick={() => setDeleteOpen(true)}
              style={{ width: 44, flexShrink: 0, padding: '11px 0', borderRadius: T.r.md, border: `1.5px solid ${T.danger.border}`, background: T.danger.bg, color: T.danger.text, fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Measurements?"
        message={`${forSelf ? measurement.customerName : measurement.memberName}'s measurements will be moved to trash. An admin can restore them later.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
