import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../../domain/entities/dashboard';

export class UserRepository {
  async getUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const docRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(docRef);

      return {
        email: firebaseUser.email ?? undefined,
        ...(snap.data() as Omit<User, 'email'>),
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}
