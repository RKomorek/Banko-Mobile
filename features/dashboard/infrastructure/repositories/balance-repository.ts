import { auth, db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export class BalanceRepository {
  async getBalance(): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) return '0.00';
      if (!db) {
        console.warn('Firestore não disponível');
        return '0.00';
      }

      // Buscar todas as transações do usuário
      const txQ = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid)
      );
      const txSnap = await getDocs(txQ);

      // Calcular saldo baseado nas transações
      let balance = 0;
      txSnap.docs.forEach(doc => {
        const tx = doc.data();
        const amount = Math.abs(tx.amount || 0);
        
        if (tx.isNegative) {
          balance -= amount; // Subtrai saídas
        } else {
          balance += amount; // Soma entradas
        }
      });

      return balance.toFixed(2);
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      throw error;
    }
  }
}
