import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import {
  getMeasurementTemplates,
  createMeasurementTemplate,
  updateMeasurementTemplate,
  deleteMeasurementTemplate,
} from '@/services/measurementTemplates';

const key = (boutiqueId: string) => ['measurementTemplates', boutiqueId];

export function useMeasurementTemplates() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: key(boutiqueId),
    queryFn: () => getMeasurementTemplates(boutiqueId),
    enabled: !!boutiqueId,
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; fields: string[]; order: number }) =>
      createMeasurementTemplate(boutiqueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Item added', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to add item', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; fields?: string[]; order?: number } }) =>
      updateMeasurementTemplate(boutiqueId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Item updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update item', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMeasurementTemplate(boutiqueId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Item deleted', { variant: 'info' });
    },
    onError: () => enqueueSnackbar('Failed to delete item', { variant: 'error' }),
  });

  return { query, createMutation, updateMutation, deleteMutation };
}
