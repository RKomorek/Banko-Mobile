import { db } from '@/firebase';
import { applyMockPagination, filterMockTransactions, mockTransactions, orderMockTransactions } from '@/shared/mocks/transactions';
import { useTransactionsStore } from '@/shared/stores';
import { collection, getDocs, limit, orderBy, query, startAfter, where, type DocumentData, type QueryConstraint, type QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useMemo } from 'react';

const PAGE_SIZE = 10;

export type TransactionType = 'cartao' | 'boleto' | 'pix';

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: Date;
  receiptUrl?: string | null;
  isNegative: boolean;
};

export type TransactionFilters = {
  type: TransactionType | 'all';
  startDate: string | null;
  endDate: string | null;
};

type FirestoreQueryArgs = {
  userId: string;
  filters: TransactionFilters;
  after?: QueryDocumentSnapshot<DocumentData> | null;
};

type TransactionListError = {
  source: 'initial' | 'loadMore' | 'refresh';
  message: string;
};

type FirestoreResult = {
  items: Transaction[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
};

function parseErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function normalizeDate(value: unknown) {
  if (value && typeof (value as { toDate?: () => unknown }).toDate === 'function') {
    const parsed = (value as { toDate: () => Date }).toDate();
    if (parsed instanceof Date && !Number.isNaN(parsed.valueOf())) {
      return parsed;
    }
  }

  if (value) {
    const parsed = new Date(value as string);
    if (parsed instanceof Date && !Number.isNaN(parsed.valueOf())) {
      return parsed;
    }
  }

  return new Date();
}

async function fetchTransactions({ userId, filters, after }: FirestoreQueryArgs): Promise<FirestoreResult> {
  const constraints: QueryConstraint[] = [where('userId', '==', userId), orderBy('date', 'desc'), limit(PAGE_SIZE)];

  if (filters.type !== 'all') {
    constraints.splice(1, 0, where('type', '==', filters.type));
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    constraints.splice(constraints.length - 1, 0, where('date', '>=', start));
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    constraints.splice(constraints.length - 1, 0, where('date', '<=', end));
  }

  if (after) {
    constraints.push(startAfter(after));
  }

  const snapshot = await getDocs(query(collection(db, 'transactions'), ...constraints));

  const items: Transaction[] = snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    const amount = Number(data.amount) || 0;

    return {
      id: docSnapshot.id,
      title: data.title ?? '',
      amount: amount,
      type: (data.type ?? 'cartao') as TransactionType,
      date: normalizeDate(data.date),
      receiptUrl: data.receiptUrl ?? null,
      isNegative: amount < 0,
    };
  });

  return {
    items,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

/**
 * Hook que gerencia transações usando Zustand
 * Integra-se com o store global para compartilhar estado entre componentes
 */
export function useTransactions({
  userId,
  filters,
  useMockData = false,
}: {
  userId: string | null;
  filters: TransactionFilters;
  useMockData?: boolean;
}) {
  const store = useTransactionsStore();
  let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  let mockSource: Transaction[] = [];
  let mockCursor = 0;

  const shouldReset = useMemo(
    () => [filters.type, filters.startDate, filters.endDate].join('-'),
    [filters.endDate, filters.startDate, filters.type]
  );

  useEffect(() => {
    if (useMockData) {
      store.setLoading(true);
      const filtered = orderMockTransactions(filterMockTransactions(mockTransactions, filters));
      const normalizedFiltered = filtered.map((transaction) => ({
        ...transaction,
        isNegative: transaction.amount < 0,
      }));
      const initialPage = applyMockPagination(normalizedFiltered, 0, PAGE_SIZE);
      mockSource = normalizedFiltered;
      mockCursor = initialPage.length;
      store.setTransactions(initialPage.map((t) => ({ ...t, isNegative: t.amount < 0 })));
      store.setHasMore(initialPage.length < normalizedFiltered.length);
      store.setError(null);
      store.setLoading(false);
      return;
    }

    let ignore = false;

    const load = async () => {
      if (!userId) {
        store.setTransactions([]);
        store.setLoading(false);
        store.setHasMore(false);
        return;
      }

      store.setLoading(true);
      store.setHasMore(true);
      store.setError(null);

      try {
        const { items, lastDoc: newLastDoc } = await fetchTransactions({
          userId,
          filters,
        });

        if (ignore) return;
        
        store.setTransactions(items);
        lastDoc = newLastDoc;
        store.setHasMore(items.length === PAGE_SIZE);
      } catch (err) {
        if (!ignore) {
          const errorMessage = parseErrorMessage(err, 'Tente novamente em instantes.');
          store.setError(errorMessage);
          store.setTransactions([]);
          lastDoc = null;
          store.setHasMore(false);
        }
      } finally {
        if (!ignore) {
          store.setLoading(false);
        }
      }
    };

    mockSource = [];
    mockCursor = 0;
    load();

    return () => {
      ignore = true;
    };
  }, [userId, shouldReset, filters, useMockData, store]);

  const loadMore = useCallback(async () => {
    if (useMockData) {
      if (!store.hasMore || store.loadingMore) {
        return;
      }

      store.setLoadingMore(true);
      const nextItems = applyMockPagination(mockSource, mockCursor, PAGE_SIZE);
      const nextCursor = mockCursor + nextItems.length;
      store.appendTransactions(nextItems.map((t) => ({ ...t, isNegative: t.amount < 0 })));
      mockCursor = nextCursor;
      store.setHasMore(nextCursor < mockSource.length);
      store.setLoadingMore(false);
      return;
    }

    if (!userId || !store.hasMore || store.loadingMore || store.loading || !lastDoc) {
      return;
    }

    store.setLoadingMore(true);

    try {
      const { items, lastDoc: nextLastDoc } = await fetchTransactions({
        userId,
        filters,
        after: lastDoc,
      });

      store.appendTransactions(items);
      lastDoc = nextLastDoc;
      store.setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      const errorMessage = parseErrorMessage(err, 'Não foi possível carregar mais.');
      store.setError(errorMessage);
    } finally {
      store.setLoadingMore(false);
    }
  }, [filters, store.loading, useMockData, userId, store.hasMore, store.loadingMore, store]);

  const refresh = useCallback(async () => {
    if (useMockData) {
      store.setLoading(true);
      const filtered = orderMockTransactions(filterMockTransactions(mockTransactions, filters));
      const normalizedFiltered = filtered.map((transaction) => ({
        ...transaction,
        isNegative: transaction.amount < 0,
      }));
      const initialPage = applyMockPagination(normalizedFiltered, 0, PAGE_SIZE);
      mockSource = normalizedFiltered;
      mockCursor = initialPage.length;
      store.setTransactions(initialPage.map((t) => ({ ...t, isNegative: t.amount < 0 })));
      store.setHasMore(initialPage.length < normalizedFiltered.length);
      store.setError(null);
      store.setLoading(false);
      return;
    }

    store.setLoading(true);

    if (!userId) {
      store.setTransactions([]);
      store.setLoading(false);
      store.setHasMore(false);
      return;
    }

    try {
      const { items, lastDoc: newLastDoc } = await fetchTransactions({
        userId,
        filters,
      });

      store.setTransactions(items);
      lastDoc = newLastDoc;
      store.setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      const errorMessage = parseErrorMessage(err, 'Não foi possível atualizar agora.');
      store.setError(errorMessage);
    } finally {
      store.setLoading(false);
    }
  }, [filters, useMockData, userId, store]);

  const clearError = useCallback(() => store.setError(null), [store]);

  return {
    transactions: store.transactions,
    loading: store.loading,
    loadingMore: store.loadingMore,
    hasMore: store.hasMore,
    loadMore,
    refresh,
    error: store.error ? { source: 'initial' as const, message: store.error } : null,
    clearError,
  };
}

export { PAGE_SIZE };

