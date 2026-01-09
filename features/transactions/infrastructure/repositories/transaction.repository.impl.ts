import { db } from '@/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { Transaction, TransactionFilters } from '../../domain/entities/transaction.entity';
import { ITransactionRepository, TransactionRepositoryResponse } from '../../domain/repositories/transaction.repository.interface';

export class FirebaseTransactionRepository implements ITransactionRepository {
  private collectionName = 'transactions';

  async getTransactions(filters: TransactionFilters): Promise<TransactionRepositoryResponse> {
    if (!db) throw new Error('Firestore não inicializado');

    const constraints: any[] = [
      where('userId', '==', filters.userId),
      orderBy('date', 'desc'),
    ];

    if (filters.type && filters.type !== 'all') {
      constraints.push(where('type', '==', filters.type));
    }

    if (filters.isNegative !== undefined) {
      constraints.push(where('isNegative', '==', filters.isNegative));
    }

    if (filters.startDate) {
      constraints.push(where('date', '>=', Timestamp.fromDate(filters.startDate)));
    }

    if (filters.endDate) {
      constraints.push(where('date', '<=', Timestamp.fromDate(filters.endDate)));
    }

    if (filters.lastDoc) {
      constraints.push(startAfter(filters.lastDoc));
    }

    const pageSize = filters.limit || 20;
    constraints.push(limit(pageSize));

    const q = query(collection(db, this.collectionName), ...constraints);
    const snapshot = await getDocs(q);

    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    return {
      transactions,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
      hasMore: snapshot.docs.length === pageSize,
    };
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    if (!db) throw new Error('Firestore não inicializado');

    const docRef = await addDoc(collection(db, this.collectionName), {
      ...transaction,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { id: docRef.id, ...transaction };
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado');

    await updateDoc(doc(db, this.collectionName, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado');

    await deleteDoc(doc(db, this.collectionName, id));
  }
}
