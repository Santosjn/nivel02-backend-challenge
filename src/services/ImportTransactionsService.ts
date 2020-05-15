import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoryRepository from '../repositories/CategoryRepository';

class ImportTransactionsService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  async execute(csvPath: string): Promise<Transaction[]> {
    const csvLines = await this.loadCSV(csvPath);

    const categoryRepository = getCustomRepository(CategoryRepository);

    interface TransactionInterface {
      title: string;
      value: number;
      type: 'income' | 'outcome';
      category_id: string;
    }

    csvLines.shift();
    let filteredCategories: string[] = csvLines.map(line => {
      const [, , , category] = line;
      return category;
    });
    filteredCategories = filteredCategories.filter(
      (item, index) => filteredCategories.indexOf(item) === index,
    );

    const createdCategories = filteredCategories.map(name => {
      return categoryRepository.create({ title: name });
    });
    const newSavedCategories = await categoryRepository.save(createdCategories);

    const createdTransactions: TransactionInterface[] = [];
    csvLines.forEach(line => {
      const [title, type, value, category] = line;
      const categoryListed = newSavedCategories.find(
        categoryItem => categoryItem.title === category,
      );
      let category_id = '';
      if (categoryListed) {
        category_id = categoryListed.id;
      }

      const transactionData = {
        title,
        value: parseInt(value, 10),
        type,
        category_id,
      } as TransactionInterface;

      createdTransactions.push(
        this.transactionsRepository.create(transactionData),
      );
    });

    // console.log(createdTransactions, '---createdTransactions');
    const transactions: Transaction[] = await this.transactionsRepository.save(
      createdTransactions,
    );

    return transactions;
  }

  private async loadCSV(csvPath: string): Promise<[string[]]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', csvPath);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const lines: [string[]] = [[]];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    await fs.promises.unlink(csvFilePath);

    return lines;
  }
}

export default ImportTransactionsService;
