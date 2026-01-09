import { Transaction, TransactionFilters } from '../entities/transaction.entity';

export interface TransactionRepositoryResponse {
  transactions: Transaction[];
  lastDoc: any;
  hasMore: boolean;
}

export interface ITransactionRepository {
  getTransactions(filters: TransactionFilters): Promise<TransactionRepositoryResponse>;
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, data: Partial<Transaction>): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
}
