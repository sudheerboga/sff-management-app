import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { getBoutique } from '@/services/boutiques';
import { buildT, type AppTheme } from '@/theme/appTheme';

export function useAppTheme(): { T: AppTheme; isDark: boolean } {
  const mode = useUiStore((s) => s.themeMode);
  const user = useAuthStore((s) => s.user);

  const { data: boutique } = useQuery({
    queryKey: ['boutique', user?.boutiqueId],
    queryFn: () => getBoutique(user!.boutiqueId!),
    enabled: !!user?.boutiqueId,
    staleTime: 5 * 60 * 1000,
  });

  const b = boutique?.branding;
  const T = buildT(mode, b?.primaryColor, b?.secondaryColor, b?.accentColor);
  return { T, isDark: mode === 'dark' };
}
