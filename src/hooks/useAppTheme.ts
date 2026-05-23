import { useUiStore } from '@/stores/uiStore';
import { buildT, type AppTheme } from '@/theme/appTheme';

export function useAppTheme(): { T: AppTheme; isDark: boolean } {
  const mode = useUiStore((s) => s.themeMode);
  const T = buildT(mode);
  return { T, isDark: mode === 'dark' };
}
