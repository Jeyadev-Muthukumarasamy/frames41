import type { FAQ } from '@prisma/client';

/**
 * FAQ repository interface
 */
export interface IFAQRepository {
  /**
   * Find all FAQs
   */
  findAll(category?: string, includeInactive?: boolean): Promise<FAQ[]>;

  /**
   * Find FAQ by ID
   */
  findById(id: string): Promise<FAQ | null>;

  /**
   * Find FAQs by category
   */
  findByCategory(category: string, includeInactive?: boolean): Promise<FAQ[]>;

  /**
   * Get all unique categories
   */
  getCategories(): Promise<string[]>;

  /**
   * Create FAQ
   */
  create(data: {
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
  }): Promise<FAQ>;

  /**
   * Update FAQ
   */
  update(id: string, data: Partial<FAQ>): Promise<FAQ>;

  /**
   * Delete FAQ
   */
  delete(id: string): Promise<void>;
}

/**
 * FAQ service interface
 */
export interface IFAQService {
  /**
   * Get all FAQs
   */
  getFAQs(category?: string, includeInactive?: boolean): Promise<FAQ[]>;

  /**
   * Get FAQ by ID
   */
  getFAQById(id: string): Promise<FAQ>;

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(category: string): Promise<FAQ[]>;

  /**
   * Get all categories
   */
  getCategories(): Promise<string[]>;

  /**
   * Create FAQ
   */
  createFAQ(data: {
    question: string;
    answer: string;
    category: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<FAQ>;

  /**
   * Update FAQ
   */
  updateFAQ(
    id: string,
    data: Partial<{
      question: string;
      answer: string;
      category: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ): Promise<FAQ>;

  /**
   * Delete FAQ
   */
  deleteFAQ(id: string): Promise<void>;
}
