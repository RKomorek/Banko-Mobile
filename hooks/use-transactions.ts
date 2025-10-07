import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/firebase';
import {
  filterTransactionsByFilters,
  mockTransactions,
  orderTransactionsByDate,
  paginateTransactions,
} from '@/mocks/transactions';

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

type TransactionListError = {
  source: 'initial' | 'loadMore' | 'refresh';
  message: string;
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
  const [dataPool, setDataPool] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<TransactionListError | null>(null);

  const initializeFromDataset = useCallback(
    (dataset: Transaction[]) => {
      const filtered = filterTransactionsByFilters(dataset, filters);
      const ordered = orderTransactionsByDate(filtered);
      const initialPage = paginateTransactions(ordered, 0, PAGE_SIZE);
      setDataPool(ordered);
      setTransactions(initialPage);
      setCursor(initialPage.length);
      setHasMore(initialPage.length < ordered.length);
    },
    [filters]
  );

  useEffect(() => {
    if (useMockData) {
      setError(null);
      initializeFromDataset(mockTransactions);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    let ignore = false;

    const load = async () => {
      if (!userId) {
        initializeFromDataset([]);
        setLoading(false);
        setHasMore(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const snapshot = await getDocs(
          query(collection(db, 'transactions'), where('userId', '==', userId))
        );

        if (ignore) return;

        const dataset = snapshot.docs.map((docSnapshot) => {
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

        initializeFromDataset(dataset);
      } catch (err) {
        if (!ignore) {
          setError({
            source: 'initial',
            message: parseErrorMessage(err, 'Tente novamente em instantes.'),
          });
          initializeFromDataset([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [initializeFromDataset, userId, useMockData]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);

    const nextItems = paginateTransactions(dataPool, cursor, PAGE_SIZE);
    const nextCursor = cursor + nextItems.length;
    setTransactions((prev) => [...prev, ...nextItems]);
    setCursor(nextCursor);
    setHasMore(nextCursor < dataPool.length);
    setLoadingMore(false);
  }, [cursor, dataPool, hasMore, loadingMore]);

  const refresh = useCallback(async () => {
    if (useMockData) {
      setRefreshing(true);
      initializeFromDataset(mockTransactions);
      setError(null);
      setRefreshing(false);
      return;
    }

    if (!userId || loading) {
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const snapshot = await getDocs(
        query(collection(db, 'transactions'), where('userId', '==', userId))
      );
      const dataset = snapshot.docs.map((docSnapshot) => {
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

      initializeFromDataset(dataset);
    } catch (err) {
      setError({
        source: 'refresh',
        message: parseErrorMessage(err, 'Não foi possível atualizar agora.'),
      });
    } finally {
      setRefreshing(false);
    }
  }, [initializeFromDataset, loading, useMockData, userId]);

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
