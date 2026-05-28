import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  addMemberToCustomer,
  CreateCustomerData,
} from '@/services/customers';
import { CustomerMember } from '@/types';

const key = (boutiqueId: string) => ['customers', boutiqueId];

export function useCustomers() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: key(boutiqueId),
    queryFn: () => getCustomers(boutiqueId),
    enabled: !!boutiqueId,
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerData) => createCustomer(boutiqueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
    },
    onError: () => enqueueSnackbar('Failed to save customer', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<CreateCustomerData, 'phone'>> }) =>
      updateCustomer(boutiqueId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Customer updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update customer', { variant: 'error' }),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ customerId, member }: { customerId: string; member: CustomerMember }) =>
      addMemberToCustomer(boutiqueId, customerId, member),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
    },
    onError: () => enqueueSnackbar('Failed to add member', { variant: 'error' }),
  });

  return { query, createMutation, updateMutation, addMemberMutation };
}
