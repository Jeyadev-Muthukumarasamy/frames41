import type { FAQ } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import type { IFAQRepository, IFAQService } from './faq.types.js';

/**
 * FAQ service implementation
 */
export class FAQService implements IFAQService {
  private readonly repository: IFAQRepository;

  constructor(repository: IFAQRepository) {
    this.repository = repository;
  }

  async getFAQs(category?: string, includeInactive = false): Promise<FAQ[]> {
    return this.repository.findAll(category, includeInactive);
  }

  async getFAQById(id: string): Promise<FAQ> {
    const faq = await this.repository.findById(id);

    if (!faq) {
      throw new NotFoundError('FAQ');
    }

    return faq;
  }

  async getFAQsByCategory(category: string): Promise<FAQ[]> {
    return this.repository.findByCategory(category);
  }

  async getCategories(): Promise<string[]> {
    return this.repository.getCategories();
  }

  async createFAQ(data: {
    question: string;
    answer: string;
    category: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<FAQ> {
    const faq = await this.repository.create({
      question: data.question,
      answer: data.answer,
      category: data.category,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    logger.info({ faqId: faq.id }, 'FAQ created');
    return faq;
  }

  async updateFAQ(
    id: string,
    data: Partial<{
      question: string;
      answer: string;
      category: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ): Promise<FAQ> {
    // Check if FAQ exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('FAQ');
    }

    const faq = await this.repository.update(id, data);
    logger.info({ faqId: id }, 'FAQ updated');
    return faq;
  }

  async deleteFAQ(id: string): Promise<void> {
    // Check if FAQ exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('FAQ');
    }

    await this.repository.delete(id);
    logger.info({ faqId: id }, 'FAQ deleted');
  }
}
