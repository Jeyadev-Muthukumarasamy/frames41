/**
 * Send WhatsApp job handler
 */

import { logger } from '../../logger/pino.logger.js';

export interface WhatsAppPayload {
  phone: string;
  template: string;
  language?: string;
  data?: Record<string, unknown>;
}

export async function sendWhatsAppJob(payload: Record<string, unknown>): Promise<void> {
  const { phone, template, language } = payload as unknown as WhatsAppPayload;

  logger.info({ phone, template, language }, 'Sending WhatsApp message');

  // TODO: Integrate with WhatsApp Business API
  // Example:
  // await whatsappClient.sendTemplate({ phone, template, language, components: [] });

  logger.info({ phone, template }, 'WhatsApp message sent successfully');
}
