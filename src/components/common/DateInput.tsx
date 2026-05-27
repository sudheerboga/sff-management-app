import { format } from 'date-fns';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase } from '@/theme/appTheme';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id?: string;
  focusedId?: string | null;
  onFocus?: (id: string) => void;
  onBlur?: () => void;
  labelColor?: string;
  padding?: string;
}

export default function DateInput({
  label, value, onChange,
  id = '', focusedId = null,
  onFocus, onBlur,
  labelColor,
  padding = '11px 12px',
}: DateInputProps) {
  const { T } = useAppTheme();
  const foc = !!id && focusedId === id;
  const activeColor = labelColor || T.violet.d;
  const display = value ? format(new Date(value + 'T00:00:00'), 'd MMM yyyy') : '';

  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, color: foc ? activeColor : T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody, transition: 'color .2s' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {/* Visual display — no pointer events so native input handles all taps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...inputBase(foc, T), padding, userSelect: 'none', pointerEvents: 'none' }}>
          <span style={{ fontSize: 14, color: display ? T.text : T.muted, fontFamily: T.fontBody, fontWeight: display ? 600 : 400 }}>
            {display || 'Select date'}
          </span>
          {!display && (
            <svg width="14" height="14" fill="none" stroke={T.muted} strokeWidth="1.8" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          )}
        </div>

        {/* Invisible native input — covers full box, opens OS date picker on tap */}
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => id && onFocus?.(id)}
          onBlur={onBlur}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 0 }}
        />

        {/* Clear button — above native input so tap clears instead of opening picker */}
        {display && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); onBlur?.(); }}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'rgb(255 162 162 / 38%)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(49 7 7 / 55%)', zIndex: 1 }}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
