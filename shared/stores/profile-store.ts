import { UserProfile } from '@/features/profile/domain/entities/user-profile.entity';
import { create } from 'zustand';

interface ProfileState {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfileField: (field: string, value: any) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  userProfile: null,
  loading: false,
  error: null,
  
  setUserProfile: (userProfile) => set({ userProfile, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateProfileField: (field, value) =>
    set((state) => ({
      userProfile: state.userProfile
        ? { ...state.userProfile, [field]: value }
        : null,
    })),
  reset: () => set({ userProfile: null, error: null, loading: false }),
}));
