import { DashboardData } from '@/features/dashboard/domain/entities/dashboard';
import { GetDashboardDataUseCase } from '@/features/dashboard/domain/usecases/get-dashboard-data';
import { BalanceRepository } from '@/features/dashboard/infrastructure/repositories/balance-repository';
import { TransactionsRepository } from '@/features/dashboard/infrastructure/repositories/transactions-repository';
import { UserRepository } from '@/features/dashboard/infrastructure/repositories/user-repository';
import { useEffect, useState } from 'react';

const userRepository = new UserRepository();
const balanceRepository = new BalanceRepository();
const transactionsRepository = new TransactionsRepository();
const getDashboardDataUseCase = new GetDashboardDataUseCase(
  userRepository,
  balanceRepository,
  transactionsRepository
);

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    user: { name: '', surname: '', email: '' },
    balance: '0.00',
    chartData: { labels: [], entradas: [], saidas: [] },
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const result = await getDashboardDataUseCase.execute();
      setDashboardData(result);
    };

    fetchDashboardData();
  }, []);

  return dashboardData;
}
