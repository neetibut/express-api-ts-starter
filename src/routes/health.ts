import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/live', (_request, response) => {
  response.json({ status: 'ok' });
});

healthRouter.get('/ready', (_request, response) => {
  // Add checks for required dependencies (database, cache, queues) here.
  response.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});
