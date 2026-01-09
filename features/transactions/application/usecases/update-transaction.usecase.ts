import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';

export class UpdateTransactionUseCase {
  constructor(private repository: ITransactionRepository) {}

  async execute(id: string, data: any): Promise<void> {
    return await this.repository.updateTransaction(id, data);
  }
}
