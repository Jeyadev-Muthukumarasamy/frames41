import type { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors/AppError.js';

/**
 * Validate request body against Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.body);
      // Replace body with parsed result (includes defaults/transforms)
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Request body validation failed', details));
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate request params against Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.params);
      req.params = result as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Request params validation failed', details));
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate request query against Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.query);
      // Replace query with parsed result
      req.query = result as Request['query'];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Request query validation failed', details));
        return;
      }
      next(error);
    }
  };
}

/**
 * Combined validator for body, params, and/or query.
 * Accepts either { body?, params?, query? } or a ZodObject with those shape keys.
 */
export function validate<TBody = unknown, TParams = unknown, TQuery = unknown>(
  schemasOrFullSchema:
    | { body?: ZodSchema<TBody>; params?: ZodSchema<TParams>; query?: ZodSchema<TQuery> }
    | ZodSchema,
) {
  // Unwrap ZodObject schemas that wrap body/params/query (e.g. z.object({ body: z.object({...}) }))
  let schemas: { body?: ZodSchema; params?: ZodSchema; query?: ZodSchema };
  if (schemasOrFullSchema instanceof ZodSchema && 'shape' in schemasOrFullSchema) {
    const shape = (schemasOrFullSchema as unknown as { shape: Record<string, ZodSchema> }).shape;
    schemas = { body: shape['body'], params: shape['params'], query: shape['query'] };
  } else {
    schemas = schemasOrFullSchema as { body?: ZodSchema; params?: ZodSchema; query?: ZodSchema };
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const allErrors: Array<{ field: string; message: string }> = [];

      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (bodyResult.success) {
          req.body = bodyResult.data;
        } else {
          allErrors.push(
            ...bodyResult.error.errors.map((err) => ({
              field: `body.${err.path.join('.')}`,
              message: err.message,
            })),
          );
        }
      }

      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (paramsResult.success) {
          req.params = paramsResult.data as Record<string, string>;
        } else {
          allErrors.push(
            ...paramsResult.error.errors.map((err) => ({
              field: `params.${err.path.join('.')}`,
              message: err.message,
            })),
          );
        }
      }

      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (queryResult.success) {
          req.query = queryResult.data as Request['query'];
        } else {
          allErrors.push(
            ...queryResult.error.errors.map((err) => ({
              field: `query.${err.path.join('.')}`,
              message: err.message,
            })),
          );
        }
      }

      if (allErrors.length > 0) {
        next(new ValidationError('Request validation failed', allErrors));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
