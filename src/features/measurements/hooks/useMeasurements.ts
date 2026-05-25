import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import { getMeasurements, createMeasurement, updateMeasurement, deleteMeasurement } from '@/services/measurements';
import { CustomerMeasurements } from '@/types';

const key = (boutiqueId: string) => ['measurements', boutiqueId];

export function useMeasurements() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: key(boutiqueId),
    queryFn: () => getMeasurements(boutiqueId),
    enabled: !!boutiqueId,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { customerId: string; memberName: string; memberId?: string; customerName: string; customerPhone: string; garments: CustomerMeasurements; notes: string }) =>
      createMeasurement(boutiqueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Measurements saved', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to save measurements', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMeasurement>[2] }) =>
      updateMeasurement(boutiqueId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Measurements updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update measurements', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMeasurement(boutiqueId, id, user!.uid, user!.name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Measurement moved to trash', { variant: 'info' });
    },
    onError: () => enqueueSnackbar('Failed to delete measurement', { variant: 'error' }),
  });

  return { query, createMutation, updateMutation, deleteMutation };
}
