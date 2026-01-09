import { Transaction } from '../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';

export class CreateTransactionUseCase {
  constructor(private repository: ITransactionRepository) {}

  async execute(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    return await this.repository.createTransaction(transaction);
  }
}
