import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { AppError } from './lib/app-error.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    pinoHttp({
      logger,
      genReqId(request: IncomingMessage, response: ServerResponse) {
        const incomingId = request.headers['x-request-id'];
        const id =
          typeof incomingId === 'string' && incomingId.length <= 128 ? incomingId : randomUUID();
        response.setHeader('x-request-id', id);
        return id;
      },
      autoLogging: {
        ignore: (request: IncomingMessage) => request.url === '/api/v1/health/live',
      },
    }),
  );

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (
          origin === undefined ||
          env.CORS_ORIGINS.includes('*') ||
          env.CORS_ORIGINS.includes(origin)
        ) {
          callback(null, true);
          return;
        }
        callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'Origin is not allowed'));
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      skip: (request) => request.path.startsWith('/api/v1/health/'),
    }),
  );

  app.get('/', (_request, response) => {
    response.json({ name: 'express-api-starter', version: '1.0.0' });
  });
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
