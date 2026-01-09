import { useAuthStore } from "./auth-store";

// Export all stores from a single file for easier imports
export { useDashboardStore, type ChartData, type DashboardMetrics } from "./dashboard-store";
export { useProfileStore } from "./profile-store";
export { useTransactionsStore, type Transaction } from "./transactions-store";
export { useAuthStore };

// Hook para inicializar stores na app
export function useInitializeStores() {
  const { initializeAuth } = useAuthStore();
  return { initializeAuth };
}

