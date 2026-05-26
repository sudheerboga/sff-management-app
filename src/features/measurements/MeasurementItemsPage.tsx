import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase } from '@/theme/appTheme';
import { useMeasurementTemplates } from './hooks/useMeasurementTemplates';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { MeasurementTemplate } from '@/types';

// ─── FieldChip ───────────────────────────────────────────────────────────────
function FieldChip({ label, onRemove, T }: { label: string; onRemove?: () => void; T: ReturnType<typeof useAppTheme>['T'] }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, padding: '3px 8px',
      borderRadius: T.r.pill, background: `${T.violet.d}14`,
      color: T.violet.d, border: `1px solid ${T.violet.d}22`,
      fontFamily: T.fontBody,
    }}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger.text, fontSize: 12, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
        >
          ✕
        </button>
      )}
    </span>
  );
}

// ─── TemplateCard ─────────────────────────────────────────────────────────────
interface TemplateCardProps {
  template: MeasurementTemplate;
  onEdit: () => void;
  onDelete: () => void;
  T: ReturnType<typeof useAppTheme>['T'];
  isDark: boolean;
}
function TemplateCard({ template, onEdit, onDelete, T, isDark }: TemplateCardProps) {
  return (
    <div style={{
      background: isDark ? 'rgba(26,21,48,0.7)' : T.card,
      border: `1px solid ${T.border}`,
      borderRadius: T.r.md, padding: '14px 16px',
      fontFamily: T.fontBody,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay }}>{template.name}</div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
          <button
            onClick={onEdit}
            style={{ width: 30, height: 30, borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2 }}
            title="Edit"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            onClick={onDelete}
            style={{ width: 30, height: 30, borderRadius: T.r.sm, border: `1.5px solid ${T.danger.border}`, background: T.danger.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger.text }}
            title="Delete"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>
      {template.fields.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {template.fields.map((f) => <FieldChip key={f} label={f} T={T} />)}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: T.muted, fontStyle: 'italic' }}>No fields added yet</div>
      )}
    </div>
  );
}

// ─── EditForm ─────────────────────────────────────────────────────────────────
interface EditFormProps {
  initialName?: string;
  initialFields?: string[];
  onSave: (name: string, fields: string[]) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  T: ReturnType<typeof useAppTheme>['T'];
  isDark: boolean;
}
function EditForm({ initialName = '', initialFields = [], onSave, onCancel, saving, T, isDark }: EditFormProps) {
  const [name, setName] = useState(initialName);
  const [fields, setFields] = useState<string[]>(initialFields);
  const [newField, setNewField] = useState('');
  const [nameError, setNameError] = useState('');
  const fieldInputRef = useRef<HTMLInputElement>(null);

  function addField() {
    const trimmed = newField.trim();
    if (!trimmed) return;
    if (fields.includes(trimmed)) { setNewField(''); return; }
    setFields((f) => [...f, trimmed]);
    setNewField('');
    fieldInputRef.current?.focus();
  }

  async function handleSave() {
    if (!name.trim()) { setNameError('Garment name is required'); return; }
    await onSave(name.trim(), fields);
  }

  return (
    <div style={{
      background: isDark ? 'rgba(26,21,48,0.9)' : T.card,
      border: `1.5px solid ${T.violet.d}44`,
      borderRadius: T.r.md, padding: 16,
      fontFamily: T.fontBody,
      boxShadow: T.sh.md,
    }}>
      {/* Name */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.violet.d, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
          Garment Name
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          placeholder="e.g. Blouse, Saree, Kurti"
          style={{ ...inputBase(false, T), width: '100%', boxSizing: 'border-box' }}
        />
        {nameError && <div style={{ fontSize: 11, color: T.danger.text, marginTop: 4 }}>{nameError}</div>}
      </div>

      {/* Fields */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.violet.d, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
          Measurement Fields
        </div>

        {fields.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {fields.map((f) => (
              <FieldChip
                key={f}
                label={f}
                T={T}
                onRemove={() => setFields((prev) => prev.filter((x) => x !== f))}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={fieldInputRef}
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addField(); } }}
            placeholder="e.g. Chest, Waist, Hip"
            style={{ ...inputBase(false, T), flex: 1, minWidth: 0 }}
          />
          <button
            onClick={addField}
            disabled={!newField.trim()}
            style={{
              padding: '10px 14px', borderRadius: T.r.md, border: 'none',
              background: newField.trim() ? T.grad.brand : (isDark ? 'rgba(255,255,255,0.06)' : T.bg2),
              color: newField.trim() ? '#fff' : T.muted,
              fontSize: 13, fontWeight: 700, cursor: newField.trim() ? 'pointer' : 'not-allowed',
              fontFamily: T.fontBody, flexShrink: 0, transition: 'all .2s',
            }}
          >
            + Add
          </button>
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Press Enter or click + Add to add each field</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1, padding: '12px 0', border: 'none', borderRadius: T.r.md,
            background: saving ? (isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand,
            color: saving ? T.muted : '#fff',
            fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: T.fontBody, boxShadow: saving ? 'none' : T.sh.brand, transition: 'all .2s',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: '12px 20px', border: `1px solid ${T.border}`, borderRadius: T.r.md,
            background: 'none', color: T.text2, fontSize: 14, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: T.fontBody,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── MeasurementItemsPage ─────────────────────────────────────────────────────
export default function MeasurementItemsPage() {
  const { T, isDark } = useAppTheme();
  const navigate = useNavigate();
  const { query, createMutation, updateMutation, deleteMutation } = useMeasurementTemplates();

  const [editingId, setEditingId]   = useState<string | null>(null);
  const [addingNew, setAddingNew]   = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const templates = query.data || [];

  async function handleCreate(name: string, fields: string[]) {
    const order = templates.length > 0 ? Math.max(...templates.map((t) => t.order)) + 1 : 0;
    await createMutation.mutateAsync({ name, fields, order });
    setAddingNew(false);
  }

  async function handleUpdate(id: string, name: string, fields: string[]) {
    await updateMutation.mutateAsync({ id, data: { name, fields } });
    setEditingId(null);
  }

  const saving = createMutation.isPending || updateMutation.isPending;
  const tf = { T, isDark };

  return (
    <div style={{ fontFamily: T.fontBody, maxWidth: 640, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, flexShrink: 0 }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay }}>Measurement Items</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              {templates.length} garment {templates.length === 1 ? 'type' : 'types'} configured
            </div>
          </div>
        </div>

        {!addingNew && (
          <button
            onClick={() => { setAddingNew(true); setEditingId(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: T.r.pill, border: 'none',
              background: T.grad.brand, color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: T.fontBody, boxShadow: T.sh.brand, flexShrink: 0,
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Add Item
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: T.border, marginBottom: 20 }} />

      {/* Add New Form */}
      {addingNew && (
        <div style={{ marginBottom: 16 }}>
          <EditForm
            onSave={handleCreate}
            onCancel={() => setAddingNew(false)}
            saving={saving}
            {...tf}
          />
        </div>
      )}

      {/* Loading */}
      {query.isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 2 }} />)}
        </div>
      ) : templates.length === 0 && !addingNew ? (
        /* Empty State */
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: isDark ? 'rgba(155,127,212,0.05)' : T.violet.pale,
          borderRadius: T.r.lg, border: `1.5px dashed ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '44'}`,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: .6 }}>📐</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay, marginBottom: 8 }}>
            No measurement items yet
          </div>
          <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 20px' }}>
            Add garment types like Blouse, Saree, or Kurti with their measurement fields — each boutique has its own list.
          </div>
          <button
            onClick={() => setAddingNew(true)}
            style={{
              padding: '11px 24px', borderRadius: T.r.pill, border: 'none',
              background: T.grad.brand, color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: T.fontBody, boxShadow: T.sh.brand,
            }}
          >
            + Add First Item
          </button>
        </div>
      ) : (
        /* Template List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.map((t) =>
            editingId === t.id ? (
              <EditForm
                key={t.id}
                initialName={t.name}
                initialFields={t.fields}
                onSave={(name, fields) => handleUpdate(t.id, name, fields)}
                onCancel={() => setEditingId(null)}
                saving={saving}
                {...tf}
              />
            ) : (
              <TemplateCard
                key={t.id}
                template={t}
                onEdit={() => { setEditingId(t.id); setAddingNew(false); }}
                onDelete={() => setDeleteId(t.id)}
                {...tf}
              />
            ),
          )}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Item"
        message="This garment type and its field definitions will be permanently removed. Existing saved measurements are not affected."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={async () => { if (deleteId) { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
