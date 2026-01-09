import { DashboardData } from '@/features/dashboard/domain/entities/entities';
import { GetDashboardDataUseCase } from '@/features/dashboard/domain/usecases/get-dashboard-data';
import { BalanceRepository } from '@/features/dashboard/infrastructure/repositories/balance-repository';
import { TransactionsRepository } from '@/features/dashboard/infrastructure/repositories/transactions-repository';
import { UserRepository } from '@/features/dashboard/infrastructure/repositories/user-repository';
import { useDashboardStore } from '@/shared/stores';
import { useEffect } from 'react';

const userRepository = new UserRepository();
const balanceRepository = new BalanceRepository();
const transactionsRepository = new TransactionsRepository();
const getDashboardDataUseCase = new GetDashboardDataUseCase(
  userRepository,
  balanceRepository,
  transactionsRepository
);

export function useDashboard() {
  const { user, metrics, chartData, loading, error, setUser, setMetrics, setChartData, setLoading, setError } = useDashboardStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const result: DashboardData = await getDashboardDataUseCase.execute();
        
        // Atualizar store com dados do dashboard
        if (result.user) setUser(result.user);
        if (result.balance) {
          setMetrics({
            balance: parseFloat(result.balance),
            income: 0,
            expenses: 0,
          });
        }
        if (result.chartData) {
          setChartData(result.chartData);
        }
        if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setUser, setMetrics, setChartData, setLoading, setError]);

  return {
    user,
    balance: metrics?.balance ?? 0,
    chartData: chartData || { labels: [], entradas: [], saidas: [] },
    loading,
    error,
  };
}
