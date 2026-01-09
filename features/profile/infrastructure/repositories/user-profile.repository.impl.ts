import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';

export class FirebaseUserProfileRepository implements IUserProfileRepository {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) throw new Error('Firestore não inicializado');

    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        return {
          uid,
          email: data.email || '',
          name: data.name || '',
          surname: data.surname || '',
          displayName: data.displayName,
          photoURL: data.photoURL,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error('Firestore não inicializado');

    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, data as any);
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      throw error;
    }
  }
}
