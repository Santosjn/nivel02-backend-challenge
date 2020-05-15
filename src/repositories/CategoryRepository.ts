import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {
  public async findByTitle(title: string): Promise<Category | null> {
    const categoryFound = await this.findOne({
      where: {
        title,
      },
    });

    return categoryFound || null;
  }
}

export default CategoryRepository;
