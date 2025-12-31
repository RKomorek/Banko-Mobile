import { ChartData, Transaction } from '@/features/dashboard/domain/entities/dashboard';
import { auth, db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export class TransactionsRepository {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const txQ = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid)
      );
      const txSnap = await getDocs(txQ);

      return txSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date),
      } as Transaction));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  aggregateByMonth(transactions: Transaction[]): ChartData {
    const entradas: { [key: string]: number } = {};
    const saidas: { [key: string]: number } = {};
    const meses: Set<string> = new Set();

    transactions.forEach(tx => {
      const mes = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
      meses.add(mes);

      if (tx.isNegative) {
        saidas[mes] = (saidas[mes] || 0) + Math.abs(tx.amount);
      } else {
        entradas[mes] = (entradas[mes] || 0) + Math.abs(tx.amount);
      }
    });

    const mesesOrdenados = Array.from(meses).sort();

    return {
      labels: mesesOrdenados.length > 0 ? mesesOrdenados : ['Sem dados'],
      entradas: mesesOrdenados.map(m => entradas[m] || 0),
      saidas: mesesOrdenados.map(m => saidas[m] || 0),
    };
  }
}
