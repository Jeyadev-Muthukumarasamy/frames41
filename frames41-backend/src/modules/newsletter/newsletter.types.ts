import type { NewsletterSubscriber } from '@prisma/client';

/**
 * Newsletter repository interface
 */
export interface INewsletterRepository {
  /**
   * Find subscriber by email
   */
  findByEmail(email: string): Promise<NewsletterSubscriber | null>;

  /**
   * Subscribe
   */
  subscribe(data: { email: string; name?: string }): Promise<NewsletterSubscriber>;

  /**
   * Unsubscribe
   */
  unsubscribe(email: string): Promise<void>;

  /**
   * Get all active subscribers
   */
  getActiveSubscribers(): Promise<NewsletterSubscriber[]>;

  /**
   * Get subscriber count
   */
  getSubscriberCount(): Promise<number>;
}

/**
 * Newsletter service interface
 */
export interface INewsletterService {
  /**
   * Subscribe to newsletter
   */
  subscribe(data: { email: string; name?: string }): Promise<NewsletterSubscriber>;

  /**
   * Unsubscribe from newsletter
   */
  unsubscribe(email: string): Promise<void>;

  /**
   * Get subscriber count
   */
  getSubscriberCount(): Promise<number>;
}
