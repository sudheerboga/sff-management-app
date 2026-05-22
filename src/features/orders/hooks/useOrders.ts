import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import { getOrders, createOrder, updateOrderStatus, deleteOrder, CreateOrderData, updateOrder } from '@/services/orders';
import { OrderStatus } from '@/types';

const key = (boutiqueId: string) => ['orders', boutiqueId];

export function useOrders() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: key(boutiqueId),
    queryFn: () => getOrders(boutiqueId),
    enabled: !!boutiqueId,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOrderData) => createOrder(boutiqueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Order created successfully', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to create order', { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(boutiqueId, orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Status updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update status', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Parameters<typeof updateOrder>[2] }) =>
      updateOrder(boutiqueId, orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Order updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update order', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(boutiqueId, orderId, user!.uid, user!.name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(boutiqueId) });
      enqueueSnackbar('Order moved to trash', { variant: 'info' });
    },
    onError: () => enqueueSnackbar('Failed to delete order', { variant: 'error' }),
  });

  return { query, createMutation, statusMutation, updateMutation, deleteMutation };
}
