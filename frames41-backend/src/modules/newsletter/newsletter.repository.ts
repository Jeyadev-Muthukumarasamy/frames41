import type { NewsletterSubscriber, PrismaClient } from '@prisma/client';
import type { INewsletterRepository } from './newsletter.types.js';

/**
 * Newsletter repository implementation
 */
export class NewsletterRepository implements INewsletterRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async subscribe(data: { email: string; name?: string }): Promise<NewsletterSubscriber> {
    const existing = await this.findByEmail(data.email);

    if (existing) {
      // Reactivate if unsubscribed
      if (!existing.isActive) {
        return this.prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            unsubscribedAt: null,
            name: data.name || existing.name,
          },
        });
      }
      return existing;
    }

    return this.prisma.newsletterSubscriber.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        isActive: true,
      },
    });
  }

  async unsubscribe(email: string): Promise<void> {
    const subscriber = await this.findByEmail(email);

    if (subscriber) {
      await this.prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          isActive: false,
          unsubscribedAt: new Date(),
        },
      });
    }
  }

  async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' },
    });
  }

  async getSubscriberCount(): Promise<number> {
    return this.prisma.newsletterSubscriber.count({
      where: { isActive: true },
    });
  }
}
