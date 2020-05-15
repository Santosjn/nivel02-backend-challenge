// import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public async execute(id: string): Promise<void> {
    const transactionFound = this.transactionsRepository.findOne({
      where: {
        id,
      },
    });

    if (!transactionFound) {
      throw new AppError('Transaction not found', 404);
    }

    await this.transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
