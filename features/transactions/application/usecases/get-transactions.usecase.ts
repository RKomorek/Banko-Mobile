import { TransactionFilters } from '../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';

export class GetTransactionsUseCase {
  constructor(private repository: ITransactionRepository) {}

  async execute(filters: TransactionFilters) {
    return await this.repository.getTransactions(filters);
  }
}
