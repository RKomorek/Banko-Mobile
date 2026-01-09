import { auth } from '@/firebase';
import { useProfileStore } from '@/shared/stores/profile-store';
import { useEffect } from 'react';
import { GetUserProfileUseCase } from '../../application/usecases/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from '../../application/usecases/update-user-profile.usecase';
import { FirebaseUserProfileRepository } from '../../infrastructure/repositories/user-profile.repository.impl';

const repository = new FirebaseUserProfileRepository();
const getUserProfileUseCase = new GetUserProfileUseCase(repository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(repository);

export function useProfile() {
  const { userProfile, loading, error, setUserProfile, setLoading, setError } = useProfileStore();

  const fetchUserProfile = async () => {
    const user = auth?.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfileUseCase.execute(user.uid);
      
      if (profile) {
        setUserProfile(profile);
      } else {
        // Se não houver perfil no Firestore, usa dados do Auth
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName?.split(' ')[0] || 'Usuário',
          surname: user.displayName?.split(' ').slice(1).join(' ') || '',
          displayName: user.displayName || undefined,
          photoURL: user.photoURL,
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    const user = auth?.currentUser;
    if (!user) return;

    try {
      await updateUserProfileUseCase.execute(user.uid, data);
      await fetchUserProfile();
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erro ao atualizar perfil');
      throw err;
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    userProfile,
    loading,
    error,
    fetchUserProfile,
    updateProfile,
  };
}
