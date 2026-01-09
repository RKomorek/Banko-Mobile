import { useAuthStore } from '@/shared/stores';
import { useEffect } from 'react';

export function useAuthState() {
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return { user, loading };
}