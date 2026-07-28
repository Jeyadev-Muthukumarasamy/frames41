import type { NewsletterSubscriber } from '@prisma/client';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import type { INewsletterRepository, INewsletterService } from './newsletter.types.js';

/**
 * Newsletter service implementation
 */
export class NewsletterService implements INewsletterService {
  private readonly repository: INewsletterRepository;

  constructor(repository: INewsletterRepository) {
    this.repository = repository;
  }

  async subscribe(data: { email: string; name?: string }): Promise<NewsletterSubscriber> {
    const subscriber = await this.repository.subscribe(data);
    logger.info({ email: data.email }, 'Newsletter subscription');
    return subscriber;
  }

  async unsubscribe(email: string): Promise<void> {
    await this.repository.unsubscribe(email);
    logger.info({ email }, 'Newsletter unsubscription');
  }

  async getSubscriberCount(): Promise<number> {
    return this.repository.getSubscriberCount();
  }
}
