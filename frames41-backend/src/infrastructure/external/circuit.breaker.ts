/**
 * Circuit breaker factory for external API calls
 * Uses opossum to prevent cascade failures
 */

import CircuitBreaker from 'opossum';
import { logger } from '../logger/pino.logger.js';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  volumeThreshold?: number;
}

const defaultOptions: CircuitBreakerOptions = {
  timeout: 10000, // 10 seconds
  errorThresholdPercentage: 50, // Open when 50% requests fail
  resetTimeout: 30000, // Try again after 30 seconds
  volumeThreshold: 5, // Min requests before opening
};

/**
 * Create a circuit breaker for an async function
 */
export function createCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  name: string,
  options?: CircuitBreakerOptions,
): CircuitBreaker {
  const breaker = new CircuitBreaker(fn, {
    ...defaultOptions,
    ...options,
    name,
  });

  breaker.on('open', () => {
    logger.warn({ service: name }, 'Circuit breaker opened');
  });

  breaker.on('halfOpen', () => {
    logger.info({ service: name }, 'Circuit breaker half-open');
  });

  breaker.on('close', () => {
    logger.info({ service: name }, 'Circuit breaker closed');
  });

  breaker.on('fallback', (result) => {
    logger.warn({ service: name, result }, 'Circuit breaker fallback executed');
  });

  return breaker;
}

/**
 * Pre-configured circuit breakers for external services
 */
export const circuitBreakers = {
  razorpay: null as CircuitBreaker | null,
  shiprocket: null as CircuitBreaker | null,
  whatsapp: null as CircuitBreaker | null,
};
