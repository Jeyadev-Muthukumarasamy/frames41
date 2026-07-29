import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../logger/pino.logger.js';

/**
 * Lazily-instantiated Resend client.
 * In development without an API key, falls back to logging the email
 * contents so the email flow still works end-to-end.
 */
let client: Resend | null = null;

function getClient(): Resend | null {
  // Skip Resend entirely in dev when the user opts out via the env flag.
  // Useful for local-only testing without a verified sending domain.
  if (env.NODE_ENV === 'development' && env.RESEND_DISABLE_IN_DEV) {
    return null;
  }
  if (!env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  messageId?: string;
  dev: boolean;
}

const fromAddress = () =>
  `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`;

/**
 * Send a transactional email via Resend.
 * In dev without an API key (or with RESEND_DISABLE_IN_DEV=true), logs the
 * email instead of sending it so the email flow still works end-to-end.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getClient();

  if (!resend) {
    logger.warn(
      { to: input.to, subject: input.subject },
      'Email not sent (local dev mode) — see "Email body (dev)" log line below for contents',
    );
    logger.info(
      { to: input.to, subject: input.subject, text: input.text },
      'Email body (dev)',
    );
    return { dev: true };
  }

  const payload: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
  } = {
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
  };
  if (input.text) payload.text = input.text;

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    // "Domain not verified" and similar 403 errors are common when testing
    // on local without a verified sending domain. Downgrade to WARN with
    // an actionable hint instead of a scary ERROR stack.
    const isDomainNotVerified =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).statusCode === 403 ||
      /domain is not verified|domain not verified/i.test(error.message ?? '');

    if (isDomainNotVerified) {
      logger.warn(
        { to: input.to, from: payload.from, errMessage: error.message },
        'Resend refused to send: sending domain is not verified. ' +
          'For local testing, set RESEND_DISABLE_IN_DEV=true in .env to silence this, ' +
          'or verify your domain at https://resend.com/domains to send real mail. ' +
          'The verification code was still generated and logged above.',
      );
      // Non-fatal: caller already logged the code in dev mode. Return as dev.
      return { dev: true };
    }

    logger.error({ err: error, to: input.to }, 'Resend email send failed');
    throw new Error(`Failed to send email: ${error.message}`);
  }

  logger.info({ messageId: data?.id, to: input.to }, 'Email sent via Resend');
  return { messageId: data?.id, dev: false };
}

/**
 * Renders the 6-digit verification code email body.
 */
export function renderVerificationEmailHtml(
  code: string,
  expiryMinutes: number,
): string {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F8F8F6; padding:32px 0;">
    <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="font-size:20px;color:#1A1A1A;margin:0 0 8px;">Verify your email</h1>
      <p style="color:#6B6B6B;font-size:14px;margin:0 0 24px;">
        Use the code below to verify your Frames41 account. It expires in ${expiryMinutes} minutes.
      </p>
      <div style="font-size:32px;font-weight:600;letter-spacing:8px;color:#800020;background:#F8F8F6;border-radius:12px;padding:20px;text-align:center;">${code}</div>
      <p style="color:#6B6B6B;font-size:12px;margin:24px 0 0;">
        If you didn't create an account, you can ignore this email.
      </p>
    </div>
  </body>
</html>`;
}