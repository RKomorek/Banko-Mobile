import { create } from "zustand";

export interface DashboardMetrics {
  balance: number;
  income: number;
  expenses: number;
  savingsGoal?: number;
}

export interface ChartData {
  labels: string[];
  entradas: number[];
  saidas: number[];
}

interface DashboardState {
  user: { name?: string; [key: string]: any } | null;
  metrics: DashboardMetrics | null;
  chartData: ChartData;
  loading: boolean;
  error: string | null;
  setUser: (user: any) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  setChartData: (chartData: ChartData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (newBalance: number) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  user: null,
  metrics: null,
  chartData: { labels: [], entradas: [], saidas: [] },
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  setMetrics: (metrics) => set({ metrics }),
  setChartData: (chartData) => set({ chartData }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateBalance: (newBalance) =>
    set((state) => ({
      metrics: state.metrics ? { ...state.metrics, balance: newBalance } : null,
    })),
  reset: () => set({ user: null, metrics: null, chartData: { labels: [], entradas: [], saidas: [] }, error: null }),
}));
