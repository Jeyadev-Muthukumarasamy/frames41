/**
 * Send email job handler
 */

import { logger } from '../../logger/pino.logger.js';

export interface EmailPayload {
  to: string;
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, unknown>;
}

export async function sendEmailJob(payload: Record<string, unknown>): Promise<void> {
  const { to, subject, template, html, text } = payload as unknown as EmailPayload;

  logger.info({ to, subject, template }, 'Sending email');

  // TODO: Integrate with SMTP client or email service
  // Example:
  // await smtpClient.send({ to, subject, html, text });

  logger.info({ to, subject }, 'Email sent successfully');
}
