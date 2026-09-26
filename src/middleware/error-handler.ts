import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../lib/app-error.js';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${request.method} ${request.path} was not found`));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.flatten(),
        requestId: request.id,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
        requestId: request.id,
      },
    });
    return;
  }

  logger.error({ err: error, requestId: request.id }, 'Unhandled request error');

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : String(error),
      requestId: request.id,
    },
  });
};
