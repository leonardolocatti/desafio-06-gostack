import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (balanceAcumulator: Balance, transaction: Transaction): Balance => {
        const newBalance = { ...balanceAcumulator };

        switch (transaction.type) {
          case 'income':
            newBalance.income += Number(transaction.value);
            break;
          case 'outcome':
            newBalance.outcome += Number(transaction.value);
            break;
          default:
            throw new AppError('Invalid type transaction was found.');
        }

        newBalance.total = newBalance.income - newBalance.outcome;

        return newBalance;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
