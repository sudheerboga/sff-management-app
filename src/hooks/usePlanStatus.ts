import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getBoutique } from '@/services/boutiques';

export function usePlanStatus() {
  const user = useAuthStore((s) => s.user);
  const { data: boutique } = useQuery({
    queryKey: ['boutique', user?.boutiqueId],
    queryFn: () => getBoutique(user!.boutiqueId!),
    enabled: !!user?.boutiqueId,
    staleTime: 5 * 60 * 1000,
  });

  const sub = boutique?.subscription;
  if (!sub) return { isReadOnly: false, isExpired: false };

  const isExpired = sub.expiresAt ? sub.expiresAt < new Date() : false;
  const isReadOnly = !sub.isActive || isExpired;

  return { isReadOnly, isExpired, planName: sub.planName };
}
