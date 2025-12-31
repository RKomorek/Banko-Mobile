import { auth, db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export class BalanceRepository {
  async getBalance(): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) return '0.00';

      const accQ = query(
        collection(db, 'accounts'),
        where('user_id', '==', user.uid)
      );
      const accSnap = await getDocs(accQ);

      if (!accSnap.empty) {
        return String(accSnap.docs[0].data().saldo || '0.00');
      }
      return '0.00';
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
}
