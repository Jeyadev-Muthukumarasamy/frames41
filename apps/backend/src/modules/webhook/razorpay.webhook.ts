import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { razorpayClient } from '../../infrastructure/external/razorpay.client.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { env } from '../../config/env.js';

/**
 * Razorpay webhook handler
 */
export async function handleRazorpayWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : JSON.stringify(req.body);

    if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) {
      res.status(400).json({ error: 'Missing signature or webhook secret' });
      return;
    }

    const isValid = razorpayClient.verifyWebhookSignature(
      rawBody,
      signature,
      env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;
    const eventId = (req.headers['x-razorpay-event-id'] as string | undefined) || event.id;

    if (!eventId) {
      res.status(400).json({ error: 'Missing event id' });
      return;
    }

    // Check for duplicate webhook
    const existingEvent = await prisma.webhookEvent.findFirst({
      where: {
        provider: 'RAZORPAY',
        eventId,
      },
    });

    if (existingEvent) {
      res.status(200).json({ message: 'Event already processed' });
      return;
    }

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'RAZORPAY',
        eventId,
        payload: event as unknown as Prisma.InputJsonValue,
      },
    });

    // Handle event
    switch (event.event) {
      case 'payment.captured':
        if (!event.payload.payment) throw new Error('Missing payment payload');
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        if (!event.payload.payment) throw new Error('Missing payment payload');
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'order.paid':
        if (!event.payload.order) throw new Error('Missing order payload');
        await handleOrderPaid(event.payload.order.entity);
        break;

      default:
        logger.info({ event: event.event }, 'Unhandled Razorpay webhook event');
    }

    await prisma.webhookEvent.update({
      where: { eventId },
      data: { processedAt: new Date() },
    });

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error({ error }, 'Razorpay webhook error');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

interface RazorpayWebhookPayment {
  [key: string]: unknown;
  id: string;
  order_id: string;
  status?: string;
  method?: string;
  amount?: number;
  error_code?: string;
  error_description?: string;
}

interface RazorpayWebhookEvent {
  id?: string;
  event: string;
  payload: {
    payment?: { entity: RazorpayWebhookPayment };
    order?: { entity: { id: string; status: string } };
  };
}

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(payment: RazorpayWebhookPayment): Promise<void> {
  logger.info({ paymentId: payment.id }, 'Payment captured webhook received');

  // Find payment record
  const paymentRecord = await prisma.payment.findFirst({
    where: { razorpayOrderId: payment.order_id },
    include: { order: true },
  });

  if (!paymentRecord || paymentRecord.status !== 'PENDING') {
    return;
  }

  if (payment.amount && payment.amount !== Math.round(Number(paymentRecord.amount) * 100)) {
    logger.warn(
      { paymentId: payment.id, orderId: paymentRecord.orderId },
      'Ignoring captured webhook with mismatched amount',
    );
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        razorpayPaymentId: payment.id,
        status: 'CAPTURED',
        method: payment.method ?? null,
        capturedAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: paymentRecord.orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: paymentRecord.orderId,
        status: 'PAID',
        note: 'Payment confirmed via webhook',
      },
    }),
  ]);
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(payment: RazorpayWebhookPayment): Promise<void> {
  logger.info({ paymentId: payment.id }, 'Payment failed webhook received');

  // Find payment record
  const paymentRecord = await prisma.payment.findFirst({
    where: { razorpayOrderId: payment.order_id },
    include: { order: { include: { items: true } } },
  });

  if (!paymentRecord || paymentRecord.status !== 'PENDING') {
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        razorpayPaymentId: payment.id,
        status: 'FAILED',
      },
    }),
    ...paymentRecord.order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
        },
      }),
    ),
    prisma.orderStatusHistory.create({
      data: {
        orderId: paymentRecord.orderId,
        status: 'PENDING',
        note: `Payment failed: ${payment.error_description || 'Unknown error'}`,
      },
    }),
  ]);
}

/**
 * Handle order paid event
 */
async function handleOrderPaid(order: { id: string; status: string }): Promise<void> {
  logger.info({ razorpayOrderId: order.id }, 'Order paid webhook received');
  // Already handled by payment.captured event
}
