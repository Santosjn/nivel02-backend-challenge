import { Router } from 'express';

import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer({ dest: 'tmp/csv/' });

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  // const transactions = await transactionsRepository.find();
  const transactions = await transactionsRepository.findWithCategories();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transaction = await new CreateTransactionService(
    transactionsRepository,
  ).execute({ title, value, type, category });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionsRepository = getCustomRepository(TransactionsRepository);
  await new DeleteTransactionService(transactionsRepository).execute(id);

  return response.send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // *** upload.single('csv_file')

    const csvPath = request.file.path;
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions = await new ImportTransactionsService(
      transactionsRepository,
    ).execute(csvPath);

    return response.json(transactions);
  },
);

export default transactionsRouter;
