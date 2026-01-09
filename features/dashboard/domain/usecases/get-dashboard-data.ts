import { DashboardData } from '@/features/dashboard/domain/entities/entities';
import { BalanceRepository } from '@/features/dashboard/infrastructure/repositories/balance-repository';
import { TransactionsRepository } from '@/features/dashboard/infrastructure/repositories/transactions-repository';
import { UserRepository } from '@/features/dashboard/infrastructure/repositories/user-repository';

export class GetDashboardDataUseCase {
  constructor(
    private userRepository: UserRepository,
    private balanceRepository: BalanceRepository,
    private transactionsRepository: TransactionsRepository
  ) {}

  async execute(): Promise<DashboardData> {
    try {
      const [user, balance, transactions] = await Promise.all([
        this.userRepository.getUser(),
        this.balanceRepository.getBalance(),
        this.transactionsRepository.getTransactions(),
      ]);

      const chartData = this.transactionsRepository.aggregateByMonth(transactions);

      return {
        user: user || { name: '', surname: '', email: '' },
        balance,
        chartData,
        loading: false,
        error: null,
      };
    } catch (error) {
      console.error('Error in GetDashboardDataUseCase:', error);
      return {
        user: { name: '', surname: '', email: '' },
        balance: '0.00',
        chartData: { labels: ['Erro'], entradas: [0], saidas: [0] },
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados',
      };
    }
  }
}
