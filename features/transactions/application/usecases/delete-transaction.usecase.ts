import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';

export class DeleteTransactionUseCase {
  constructor(private repository: ITransactionRepository) {}

  async execute(id: string): Promise<void> {
    return await this.repository.deleteTransaction(id);
  }
}
