import { auth } from '@/firebase';
import { useTransactionsStore } from '@/shared/stores/transactions-store';
import { useEffect } from 'react';
import { GetTransactionsUseCase } from '../../application/usecases/get-transactions.usecase';
import { FirebaseTransactionRepository } from '../../infrastructure/repositories/transaction.repository.impl';

const repository = new FirebaseTransactionRepository();
const getTransactionsUseCase = new GetTransactionsUseCase(repository);

export function useTransactions() {
  const {
    transactions,
    loading,
    loadingMore,
    hasMore,
    lastDoc,
    typeFilter,
    entryExitFilter,
    dateRange,
    setTransactions,
    appendTransactions,
    setLoading,
    setLoadingMore,
    setHasMore,
    setLastDoc,
    setError,
    reset,
  } = useTransactionsStore();

  const fetchTransactions = async (loadMore = false) => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (loadMore) {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);
    } else {
      setLoading(true);
      reset();
    }

    try {
      const filters: any = {
        userId: user.uid,
        lastDoc: loadMore ? lastDoc : null,
      };

      if (typeFilter !== 'all') filters.type = typeFilter;
      if (entryExitFilter === 'entrada') filters.isNegative = false;
      if (entryExitFilter === 'saida') filters.isNegative = true;
      if (dateRange.start) filters.startDate = new Date(dateRange.start);
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        filters.endDate = endDate;
      }

      const result = await getTransactionsUseCase.execute(filters);

      if (loadMore) {
        appendTransactions(result.transactions);
      } else {
        setTransactions(result.transactions);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      setError(null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, entryExitFilter, dateRange.start, dateRange.end]);

  return {
    transactions,
    loading,
    loadingMore,
    hasMore,
    fetchTransactions,
    loadMore: () => fetchTransactions(true),
  };
}
