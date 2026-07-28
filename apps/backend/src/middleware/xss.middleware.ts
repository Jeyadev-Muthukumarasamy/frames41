/**
 * XSS sanitization middleware
 * Sanitizes HTML in user-generated content using DOMPurify
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../infrastructure/logger/pino.logger.js';

// Create DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Allowed tags for rich text (reviews, blog posts)
const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'];

// Allowed attributes
const ALLOWED_ATTR: string[] = [];

/**
 * Sanitize HTML string
 */
export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Middleware to sanitize request body fields
 */
export function createSanitizeMiddleware(fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      for (const field of fields) {
        if (typeof req.body[field] === 'string') {
          const original = req.body[field];
          req.body[field] = sanitizeHtml(original);

          if (original !== req.body[field]) {
            logger.debug({ field }, 'XSS sanitized field');
          }
        }
      }
    }
    next();
  };
}

/**
 * Pre-configured sanitizers for specific routes
 */
export const sanitizeReviewBody = createSanitizeMiddleware(['body', 'title']);
export const sanitizeBlogContent = createSanitizeMiddleware(['content', 'excerpt']);
export const sanitizeFaqContent = createSanitizeMiddleware(['answer']);
