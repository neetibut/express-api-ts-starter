import { createServer } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = createServer(createApp());
let isShuttingDown = false;

server.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT, environment: env.NODE_ENV }, 'API server started');
});

function shutdown(signal: NodeJS.Signals): void {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown started');

  const forceShutdownTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out; forcing exit');
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);
  forceShutdownTimer.unref();

  server.close((error) => {
    clearTimeout(forceShutdownTimer);
    if (error) {
      logger.error({ err: error }, 'Failed to close HTTP server');
      process.exitCode = 1;
    }
  });
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  shutdown('SIGTERM');
});
