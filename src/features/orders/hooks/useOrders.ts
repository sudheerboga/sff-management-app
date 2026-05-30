import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import { getOrders, createOrder, updateOrderStatus, deleteOrder, CreateOrderData, updateOrder, addPaymentEntry, updateMaterialCost } from '@/services/orders';
import { OrderStatus, PaymentEntry } from '@/types';

const key = (boutiqueId: string) => ['orders', boutiqueId];
const pageKey = (boutiqueId: string) => ['orders-page', boutiqueId];
const searchKey = (boutiqueId: string) => ['orders-all', boutiqueId];
const countKey = (boutiqueId: string) => ['orders-count', boutiqueId];

// Used after create/delete/full-edit — everything must reflect the change
function invalidateAll(qc: ReturnType<typeof useQueryClient>, boutiqueId: string) {
  qc.invalidateQueries({ queryKey: key(boutiqueId) });
  qc.invalidateQueries({ queryKey: pageKey(boutiqueId) });
  qc.invalidateQueries({ queryKey: searchKey(boutiqueId) });
  qc.invalidateQueries({ queryKey: countKey(boutiqueId) });
}

// Used after status/payment/cost — only the paginated view and active search need updating.
// Reports and Customers (which use the full list) can stay slightly stale to save reads.
function invalidatePage(qc: ReturnType<typeof useQueryClient>, boutiqueId: string) {
  qc.invalidateQueries({ queryKey: pageKey(boutiqueId) });
  qc.invalidateQueries({ queryKey: searchKey(boutiqueId) });
}

export function useOrders() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const boutiqueName = user?.boutiqueName || 'Boutique';
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: key(boutiqueId),
    queryFn: () => getOrders(boutiqueId),
    enabled: !!boutiqueId,
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateOrderData, 'boutiqueName'>) =>
      createOrder(boutiqueId, { ...data, boutiqueName }),
    onSuccess: () => {
      invalidateAll(qc, boutiqueId);
      enqueueSnackbar('Order created', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to create order', { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(boutiqueId, orderId, status),
    onSuccess: () => {
      invalidatePage(qc, boutiqueId);
      enqueueSnackbar('Status updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update status', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Parameters<typeof updateOrder>[2] }) =>
      updateOrder(boutiqueId, orderId, data),
    onSuccess: () => {
      invalidateAll(qc, boutiqueId);
      enqueueSnackbar('Order updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update order', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrder(boutiqueId, orderId, user!.uid, user!.name),
    onSuccess: () => {
      invalidateAll(qc, boutiqueId);
      enqueueSnackbar('Order moved to trash', { variant: 'info' });
    },
    onError: () => enqueueSnackbar('Failed to delete order', { variant: 'error' }),
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({ orderId, payments, totalAmount }: { orderId: string; payments: PaymentEntry[]; totalAmount: number }) =>
      addPaymentEntry(boutiqueId, orderId, payments, totalAmount),
    onSuccess: () => {
      invalidateAll(qc, boutiqueId);
      enqueueSnackbar('Payment recorded', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to record payment', { variant: 'error' }),
  });

  const updateMaterialCostMutation = useMutation({
    mutationFn: ({ orderId, materialCost, totalAmount }: { orderId: string; materialCost: number; totalAmount: number }) =>
      updateMaterialCost(boutiqueId, orderId, materialCost, totalAmount),
    onSuccess: () => {
      invalidateAll(qc, boutiqueId);
      enqueueSnackbar('Material cost updated', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to update material cost', { variant: 'error' }),
  });

  return { query, createMutation, statusMutation, updateMutation, deleteMutation, addPaymentMutation, updateMaterialCostMutation };
}
