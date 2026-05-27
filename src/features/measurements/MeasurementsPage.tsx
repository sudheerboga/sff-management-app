import { useState, useMemo } from 'react';
import { Box, Grid, Skeleton, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StraightenIcon from '@mui/icons-material/Straighten';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMeasurements } from './hooks/useMeasurements';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { buildMeasurementMessage, shareMeasurementWhatsApp } from '@/utils/whatsapp';

const CHIP_PALETTES: { bg: string; color: string }[] = [
  { bg: '#EDE7F6', color: '#5E35B1' },
  { bg: '#FFF3E0', color: '#E65100' },
  { bg: '#E0F2F1', color: '#00695C' },
  { bg: '#FCE4EC', color: '#C2185B' },
  { bg: '#E3F2FD', color: '#1565C0' },
  { bg: '#F1F8E9', color: '#33691E' },
  { bg: '#F3E5F5', color: '#6A1B9A' },
  { bg: '#FBE9E7', color: '#BF360C' },
  { bg: '#E0F7FA', color: '#006064' },
  { bg: '#E8EAF6', color: '#283593' },
];

function chipPalette(name: string) {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CHIP_PALETTES[hash % CHIP_PALETTES.length];
}

export default function MeasurementsPage() {
  const { T } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const { query, deleteMutation } = useMeasurements();
  const measurements = query.data || [];
  const navigate = useNavigate();

  const [search,   setSearch]   = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(e: React.MouseEvent, m: (typeof measurements)[0]) {
    e.stopPropagation();
    const text = buildMeasurementMessage(m);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(m.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // silent fail
    }
  }

  function handleWhatsApp(e: React.MouseEvent, m: (typeof measurements)[0]) {
    e.stopPropagation();
    shareMeasurementWhatsApp(m);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return measurements;
    const s = search.toLowerCase();
    return measurements.filter((m) => m.customerName.toLowerCase().includes(s) || m.customerPhone?.includes(s));
  }, [measurements, search]);

  const isStaff = user?.role === 'staff';
  const { isReadOnly } = usePlanStatus();

  return (
    <Box>
      <PageHeader
        title="Measurements"
        subtitle={`${measurements.length} customers`}
        actionLabel={isStaff || isReadOnly ? undefined : 'New Measurement'}
        onAction={isStaff || isReadOnly ? undefined : () => navigate('/measurements/new')}
      />

      {/* Manage measurement items — admin only */}
      {user?.role === 'admin' && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/measurements/items')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: T.r.pill,
              border: `1.5px solid ${T.border}`, background: 'none',
              color: T.text2, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.fontBody,
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Manage Items
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, display: 'flex', pointerEvents: 'none' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </span>
        <input
          type="text"
          placeholder="Search customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px 11px 38px',
            border: `1.5px solid ${T.border}`, borderRadius: T.r.md,
            background: T.inputBg, color: T.text,
            fontSize: 14, fontFamily: T.fontBody,
            outline: 'none', boxSizing: 'border-box',
            WebkitTextFillColor: T.text,
          }}
        />
      </div>

      {query.isLoading ? (
        <Grid container spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<StraightenIcon />}
          title={search ? 'No results' : 'No measurements yet'}
          description={search ? 'Try a different name or phone number' : 'Add your first customer measurement to get started'}
          actionLabel={!isStaff && !isReadOnly && !search ? 'Add Measurement' : undefined}
          onAction={() => navigate('/measurements/new')}
        />
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.id}>
              <div
                style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: T.r.md, padding: '14px 16px',
                  fontFamily: T.fontBody, cursor: 'pointer',
                  transition: 'box-shadow .18s',
                }}
                onClick={() => navigate(`/measurements/view/${m.id}`, { state: { measurement: m } })}
              >
                {/* Name + actions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>
                      {m.memberName && m.memberName !== m.customerName ? m.memberName : m.customerName}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                      {m.memberName && m.memberName !== m.customerName ? m.customerName : m.customerPhone || ''}
                    </div>
                  </div>
                  {!isStaff && !isReadOnly && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/measurements/edit/${m.id}`, { state: { measurement: m } }); }}
                        style={{ width: 30, height: 30, borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2 }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(m.id); }}
                        style={{ width: 30, height: 30, borderRadius: T.r.sm, border: `1.5px solid ${T.danger.border}`, background: T.danger.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger.text }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Garment chips */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                  {Object.keys(m.garments).map((g) => (
                    <span key={g} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: T.r.sm, background: `${T.violet.d}14`, color: T.violet.d, border: `1px solid ${T.violet.d}22` }}>
                      {g}
                    </span>
                  ))}
                </div>

                {m.notes && (
                  <div style={{ fontSize: 12, color: T.text2, fontStyle: 'italic', marginBottom: 6, lineHeight: 1.5 }}>{m.notes}</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    Updated {format(m.updatedAt, 'd MMM yyyy')}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {/* Copy to clipboard */}
                    <button
                      onClick={(e) => handleCopy(e, m)}
                      title="Copy measurements"
                      style={{ height: 28, padding: '0 9px', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: copiedId === m.id ? T.success.text : T.text2, fontSize: 11, fontWeight: 600, fontFamily: T.fontBody, transition: 'color .2s' }}
                    >
                      {copiedId === m.id
                        ? <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                        : <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy</>
                      }
                    </button>
                    {/* Open WhatsApp */}
                    <button
                      onClick={(e) => handleWhatsApp(e, m)}
                      title="Send via WhatsApp"
                      style={{ height: 28, padding: '0 9px', borderRadius: T.r.sm, border: 'none', background: 'linear-gradient(135deg, rgb(37, 211, 102), rgb(18, 140, 126))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: T.fontBody, boxShadow: 'rgba(37, 211, 102, 0.25) 0px 4px 14px' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.136 1.535 5.875L0 24l6.306-1.504A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-4.964-1.346l-.356-.212-3.741.892.945-3.617-.232-.373A9.79 9.79 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818s9.818 4.397 9.818 9.818-4.397 9.818-9.818 9.818z"/></svg>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      )}

      {!isStaff && !isReadOnly && (
        <Fab size="medium" onClick={() => navigate('/measurements/new')}
          sx={{ position: 'fixed', bottom: 24, right: 24, display: { xs: 'none', md: 'flex' } }}>
          <AddIcon />
        </Fab>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Measurement"
        message="This customer's measurements will be moved to trash. They can be restored by the super admin."
        confirmLabel="Delete"
        onConfirm={async () => { if (deleteId) { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
