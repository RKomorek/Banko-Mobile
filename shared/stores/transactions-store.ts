import { create } from "zustand";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "cartao" | "boleto" | "pix";
  date: any;
  isNegative: boolean;
  receiptUrl?: string | null;
  userId?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  lastDoc: any;
  typeFilter: string;
  entryExitFilter: string;
  dateRange: { start: string | null; end: string | null };
  
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  setTransactions: (transactions: Transaction[]) => void;
  appendTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setLastDoc: (doc: any) => void;
  setTypeFilter: (filter: string) => void;
  setEntryExitFilter: (filter: string) => void;
  setDateRange: (range: { start: string | null; end: string | null }) => void;
  clearTransactions: () => void;
  reset: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  lastDoc: null,
  typeFilter: 'all',
  entryExitFilter: 'all',
  dateRange: { start: null, end: null },
  
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  setTransactions: (transactions) => set({ transactions, error: null }),
  appendTransactions: (newTransactions) =>
    set((state) => ({
      transactions: [...state.transactions, ...newTransactions],
    })),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMore }),
  setLastDoc: (lastDoc) => set({ lastDoc }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setEntryExitFilter: (entryExitFilter) => set({ entryExitFilter }),
  setDateRange: (dateRange) => set({ dateRange }),
  clearTransactions: () => set({ transactions: [], error: null, hasMore: true }),
  reset: () => set({ 
    transactions: [], 
    lastDoc: null, 
    hasMore: true, 
    error: null 
  }),
}));
