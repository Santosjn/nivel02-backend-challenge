import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let totalIncome = 0;
    let totalOutcome = 0;

    const transactions = await this.find();

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.value;
      } else {
        totalOutcome += t.value;
      }
    });

    const newBalance = {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };

    return newBalance;
  }
}

export default TransactionsRepository;
