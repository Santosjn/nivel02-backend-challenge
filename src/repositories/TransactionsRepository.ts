import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import CategoryRepository from './CategoryRepository';


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

  public async findWithCategories() {
    const transactions = await this.find();

    const mappedTransactions = transactions.map(async t => {
      const categoryRepository = getCustomRepository(CategoryRepository);
      const category = await categoryRepository.findOne(t.category_id);

      return {
        id: t.id,
        title: t.title,
        type: t.type,
        value: t.value,
        created_at: t.created_at,
        updated_at: t.updated_at,
        category
      }

    });

    const result = await Promise.all(mappedTransactions);
    return result;
  }
}

export default TransactionsRepository;
