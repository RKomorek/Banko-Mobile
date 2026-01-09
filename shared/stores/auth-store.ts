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
        return;
      }
      if (!auth) {
        console.error('[AuthStore] Auth não inicializado');
        set({ loading: false });

        return;
      }
      
      // Fallback timeout: se não receber resposta em 5s, desliga loading
      const timeout = setTimeout(() => {
        set({ loading: false });
      }, 5000);
      
      unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
        clearTimeout(timeout);
        set({ user: firebaseUser, loading: false });
      });
    },
    logout: async () => {
      try {
        if (!auth) {
          throw new Error("Auth não inicializado");
        }
        await signOut(auth!);
        set({ user: null });
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    },
  };
});
