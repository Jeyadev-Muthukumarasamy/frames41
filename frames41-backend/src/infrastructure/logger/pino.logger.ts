/**
 * Pino logger with log rotation for production
 */

import { mkdirSync } from 'fs';
import { pino } from 'pino';
import { pinoHttp } from 'pino-http';
import { env } from '../../config/env.js';

// Ensure log directory exists
const logDir = env.LOG_DIR;
try {
  mkdirSync(logDir, { recursive: true });
} catch {
  // Directory may already exist
}

/**
 * Base logger configuration
 */
const baseLoggerConfig: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  base: {
    pid: process.pid,
    env: env.NODE_ENV,
  },
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
    bindings: (bindings: pino.Bindings) => ({
      pid: bindings.pid,
      env: env.NODE_ENV,
    }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.code',
      'req.body.token',
      'req.body.refreshToken',
      'res.body.token',
      'res.body.refreshToken',
      'res.body.accessToken',
      '*.password',
      '*.token',
      '*.secret',
      '*.apiKey',
      '*.api_key',
    ],
    remove: true,
  },
};

/**
 * Create transport based on environment
 */
function createTransport(): pino.TransportMultiOptions | undefined {
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
    return undefined; // Use default stdout with pretty print in dev
  }

  // Production: structured JSON logs to files with rotation
  return {
    targets: [
      {
        target: 'pino-roll',
        level: 'info',
        options: {
          file: `${logDir}/app.log`,
          frequency: 'daily',
          mkdir: true,
          limit: { count: Number(env.LOG_RETENTION_DAYS) }, // Keep last N days
        },
      },
      {
        target: 'pino-roll',
        level: 'error',
        options: {
          file: `${logDir}/error.log`,
          frequency: 'daily',
          mkdir: true,
          limit: { count: Number(env.LOG_RETENTION_DAYS) },
        },
      },
    ],
  };
}

/**
 * Application logger instance
 */
const transport = createTransport();
export const logger = transport
  ? pino(baseLoggerConfig, pino.transport(transport))
  : pino(baseLoggerConfig);

/**
 * HTTP request logger middleware
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed ${res.statusCode}: ${err?.message}`;
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

/**
 * Create a child logger with additional context
 */
export function createChildLogger(bindings: pino.Bindings): pino.Logger {
  return logger.child(bindings);
}
