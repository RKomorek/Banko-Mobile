export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'pix' | 'cartao' | 'boleto';
  isNegative: boolean;
  date: Date | { seconds: number; toDate?: () => Date };
  receiptUrl?: string | null;
  receiptFileName?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionFilters {
  userId: string;
  type?: string;
  isNegative?: boolean;
  startDate?: Date;
  endDate?: Date;
  lastDoc?: any;
  limit?: number;
}
