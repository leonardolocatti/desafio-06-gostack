import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total - value < 0) {
        throw new AppError('Invalid balance');
      }
    }

    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    let categoryTransaction;

    if (!categoryExists) {
      categoryTransaction = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryTransaction);
    } else {
      categoryTransaction = categoryExists;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: categoryTransaction,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
