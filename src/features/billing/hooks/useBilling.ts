import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import { getBills, createBill, deleteBill, CreateBillData } from '@/services/billing';

const key = (boutiqueId: string) => ['billing', boutiqueId];

export function useBilling() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: key(boutiqueId),
    queryFn: () => getBills(boutiqueId),
    enabled: !!boutiqueId,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBillData) => createBill(boutiqueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Bill created', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to create bill', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBill(boutiqueId, id, user!.uid, user!.name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Bill moved to trash', { variant: 'info' });
    },
    onError: () => enqueueSnackbar('Failed to delete bill', { variant: 'error' }),
  });

  return { query, createMutation, deleteMutation };
}
