import { db } from '@/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 10;
const CACHE_KEY = 'transactions_cache';
const CACHE_EXPIRY = 5 * 60 * 1000;

export type TransactionType = 'cartao' | 'boleto' | 'pix';

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: Date;
  receiptUrl?: string | null;
  isNegative?: boolean;
};

export type TransactionFilters = {
  type: TransactionType | 'all';
  startDate: string | null;
  endDate: string | null;
  entryExit?: 'all' | 'entrada' | 'saida';
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

async function getCachedTransactions(userId: string, filters: TransactionFilters): Promise<Transaction[] | null> {
  try {
    const cacheKey = `${CACHE_KEY}_${userId}_${JSON.stringify(filters)}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return data.map((item: any) => ({
      ...item,
      date: new Date(item.date),
    }));
  } catch {
    return null;
  }
}

async function setCachedTransactions(userId: string, filters: TransactionFilters, transactions: Transaction[]) {
  try {
    const cacheKey = `${CACHE_KEY}_${userId}_${JSON.stringify(filters)}`;
    const data = transactions.map(item => ({
      ...item,
      date: item.date.toISOString(),
    }));
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('Failed to cache transactions:', error);
  }
}

async function fetchTransactions({ userId, filters, after }: FirestoreQueryArgs): Promise<FirestoreResult> {
  const constraints: QueryConstraint[] = [where('userId', '==', userId), orderBy('date', 'desc'), limit(PAGE_SIZE)];

  if (filters.type !== 'all') {
    constraints.splice(1, 0, where('type', '==', filters.type));
  }

  if (filters.entryExit === 'entrada') {
    constraints.splice(constraints.length - 1, 0, where('isNegative', '==', false));
  } else if (filters.entryExit === 'saida') {
    constraints.splice(constraints.length - 1, 0, where('isNegative', '==', true));
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    constraints.splice(constraints.length - 1, 0, where('date', '>=', Timestamp.fromDate(start)));
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    constraints.splice(constraints.length - 1, 0, where('date', '<=', Timestamp.fromDate(end)));
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
      isNegative: data.isNegative ?? false,
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
}: {
  userId: string | null;
  filters: TransactionFilters;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState<TransactionListError | null>(null);

  const shouldReset = useMemo(
    () => [filters.type, filters.startDate, filters.endDate, filters.entryExit].join('-'),
    [filters.endDate, filters.startDate, filters.type, filters.entryExit]
  );

  useEffect(() => {
    let ignore = false;
  
    const load = async () => {
      if (!userId) {
        setTransactions([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const cached = await getCachedTransactions(userId, filters);
        if (cached && cached.length > 0 && !ignore) {
          setTransactions(cached);
          setHasMore(cached.length === PAGE_SIZE);
        }
  
        const { items, lastDoc: newLastDoc } = await fetchTransactions({
          userId,
          filters,
        });
  
        if (ignore) return;
  
        setTransactions(items);
        setLastDoc(newLastDoc);
        setHasMore(items.length === PAGE_SIZE);
  
        await setCachedTransactions(userId, filters, items);
      } catch (err) {
        if (!ignore) {
          setError({
            source: 'initial',
            message: parseErrorMessage(err, 'Erro ao carregar transações'),
          });
          setTransactions([]);
          setHasMore(false);
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
  }, [userId, shouldReset]);
  

  const loadMore = useCallback(async () => {

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
  }, [filters, hasMore, lastDoc, loading, loadingMore, userId]);

  const refresh = useCallback(async () => {


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
  }, [filters, loading, userId]);

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

