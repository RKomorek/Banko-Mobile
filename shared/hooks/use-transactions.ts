import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { db } from '@/firebase';
import {
  applyMockPagination,
  filterMockTransactions,
  mockTransactions,
  orderMockTransactions,
} from '@/shared/mocks/transactions';

const PAGE_SIZE = 10;

export type TransactionType = 'cartao' | 'boleto' | 'pix';

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: Date;
  receiptUrl?: string | null;
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

    return {
      id: docSnapshot.id,
      title: data.title ?? '',
      amount: Number(data.amount) || 0,
      type: (data.type ?? 'cartao') as TransactionType,
      date: normalizeDate(data.date),
      receiptUrl: data.receiptUrl ?? null,
    };
  });

  return {
    items,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

export function useTransactions({
  userId,
  filters,
  useMockData = false,
}: {
  userId: string | null;
  filters: TransactionFilters;
  useMockData?: boolean;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState<TransactionListError | null>(null);
  const [mockSource, setMockSource] = useState<Transaction[]>([]);
  const [mockCursor, setMockCursor] = useState(0);

  const shouldReset = useMemo(
    () => [filters.type, filters.startDate, filters.endDate].join('-'),
    [filters.endDate, filters.startDate, filters.type]
  );

  useEffect(() => {
    if (useMockData) {
      setLoading(true);
      const filtered = orderMockTransactions(filterMockTransactions(mockTransactions, filters));
      const initialPage = applyMockPagination(filtered, 0, PAGE_SIZE);
      setMockSource(filtered);
      setTransactions(initialPage);
      setMockCursor(initialPage.length);
      setHasMore(initialPage.length < filtered.length);
      setLastDoc(null);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    let ignore = false;

    const load = async () => {
      if (!userId) {
        setTransactions([]);
        setLoading(false);
        setHasMore(false);
        return;
      }

      setLoading(true);
      setHasMore(true);
      setError(null);

      try {
        const { items, lastDoc: newLastDoc } = await fetchTransactions({
          userId,
          filters,
        });

        if (ignore) return;

        setTransactions(items);
        setLastDoc(newLastDoc);
        setHasMore(items.length === PAGE_SIZE);
      } catch (err) {
        if (!ignore) {
          setError({
            source: 'initial',
            message: parseErrorMessage(err, 'Tente novamente em instantes.'),
          });
          setTransactions([]);
          setLastDoc(null);
          setHasMore(false);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    setMockSource([]);
    setMockCursor(0);
    load();

    return () => {
      ignore = true;
    };
  }, [userId, shouldReset, filters, useMockData]);

  const loadMore = useCallback(async () => {
    if (useMockData) {
      if (!hasMore || loadingMore) {
        return;
      }

      setLoadingMore(true);
      const nextItems = applyMockPagination(mockSource, mockCursor, PAGE_SIZE);
      const nextCursor = mockCursor + nextItems.length;
      setTransactions((prev) => [...prev, ...nextItems]);
      setMockCursor(nextCursor);
      setHasMore(nextCursor < mockSource.length);
      setLoadingMore(false);
      return;
    }

    if (!userId || !hasMore || loadingMore || loading || !lastDoc) {
      return;
    }

    setLoadingMore(true);

    try {
      const { items, lastDoc: nextLastDoc } = await fetchTransactions({
        userId,
        filters,
        after: lastDoc,
      });

      setTransactions((prev) => [...prev, ...items]);
      setLastDoc(nextLastDoc);
      setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      setError({
        source: 'loadMore',
        message: parseErrorMessage(err, 'Verifique sua conexão e tente novamente.'),
      });
    } finally {
      setLoadingMore(false);
    }
  }, [filters, hasMore, lastDoc, loading, loadingMore, mockCursor, mockSource, useMockData, userId]);

  const refresh = useCallback(async () => {
    if (useMockData) {
      setRefreshing(true);
      const filtered = orderMockTransactions(filterMockTransactions(mockTransactions, filters));
      const initialPage = applyMockPagination(filtered, 0, PAGE_SIZE);
      setMockSource(filtered);
      setTransactions(initialPage);
      setMockCursor(initialPage.length);
      setHasMore(initialPage.length < filtered.length);
      setError(null);
      setRefreshing(false);
      return;
    }

    if (!userId || loading) {
      return;
    }

    setRefreshing(true);

    try {
      const { items, lastDoc: newLastDoc } = await fetchTransactions({
        userId,
        filters,
      });

      setTransactions(items);
      setLastDoc(newLastDoc);
      setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      setError({
        source: 'refresh',
        message: parseErrorMessage(err, 'Não foi possível atualizar agora.'),
      });
    } finally {
      setRefreshing(false);
    }
  }, [filters, loading, useMockData, userId]);

  const clearError = useCallback(() => setError(null), []);

  return {
    transactions,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    loadMore,
    refresh,
    error,
    clearError,
  };
}

export { PAGE_SIZE };

