import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { create } from "zustand";

import { auth } from "@/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Inicializa listener de autenticação
  let unsubscribe: (() => void) | null = null;

  return {
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    initializeAuth: () => {
      if (unsubscribe) {
        console.log('[AuthStore] Already initialized');
        return;
      }
      console.log('[AuthStore] Initializing auth listener');
      
      // Fallback timeout: se não receber resposta em 5s, desliga loading
      const timeout = setTimeout(() => {
        console.log('[AuthStore] Timeout reached, setting loading to false');
        set({ loading: false });
      }, 5000);
      
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('[AuthStore] Auth state changed:', firebaseUser?.email || 'no user');
        clearTimeout(timeout);
        set({ user: firebaseUser, loading: false });
      });
    },
    logout: async () => {
      try {
        await signOut(auth);
        set({ user: null });
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    },
  };
});
