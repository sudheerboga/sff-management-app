import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { getOrdersPage, getOrdersCount, OrdersPage } from '@/services/orders';

type Cursor = QueryDocumentSnapshot<DocumentData> | null;

const PAGE_SIZE = 25;

export function useOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';

  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<Map<number, Cursor>>(new Map([[1, null]]));

  const cursor = cursors.get(page) ?? null;

  const result = useQuery<OrdersPage>({
    queryKey: ['orders-page', boutiqueId, page, cursor?.id ?? 'start'],
    queryFn: () => getOrdersPage(boutiqueId, cursor, PAGE_SIZE),
    enabled: !!boutiqueId,
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });

  // 1 read total regardless of order count — cached 5 min
  const countResult = useQuery<number>({
    queryKey: ['orders-count', boutiqueId],
    queryFn: () => getOrdersCount(boutiqueId),
    enabled: !!boutiqueId,
    staleTime: 5 * 60_000,
  });

  const goNext = useCallback(() => {
    if (!result.data?.hasMore) return;
    const nextPage = page + 1;
    if (!cursors.has(nextPage)) {
      setCursors((prev) => new Map(prev).set(nextPage, result.data!.lastDoc));
    }
    setPage(nextPage);
  }, [result.data, page, cursors]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
    setCursors(new Map([[1, null]]));
  }, []);

  return {
    orders: result.data?.orders ?? [],
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    page,
    hasMore: result.data?.hasMore ?? false,
    totalCount: countResult.data ?? null,
    totalPages: countResult.data ? Math.ceil(countResult.data / PAGE_SIZE) : null,
    goNext,
    goPrev,
    resetPage,
    queryData: result.data,
  };
}
