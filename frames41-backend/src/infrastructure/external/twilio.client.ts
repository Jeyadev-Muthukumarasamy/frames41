import { env } from '../../config/env.js';
import { logger } from '../logger/pino.logger.js';

interface SendSmsInput {
  to: string;
  body: string;
}

function hasTwilioConfig(): boolean {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_PHONE);
}

export async function sendSms({ to, body }: SendSmsInput): Promise<void> {
  if (!hasTwilioConfig()) {
    logger.info({ to, body }, 'Twilio SMS skipped because credentials are not configured');
    return;
  }

  const params = new URLSearchParams({
    To: to,
    From: env.TWILIO_FROM_PHONE as string,
    Body: body,
  });

  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, errorText, to }, 'Twilio SMS failed');
    throw new Error('Failed to send OTP SMS');
  }

  logger.info({ to }, 'Twilio SMS sent');
}