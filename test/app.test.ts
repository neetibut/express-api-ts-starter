import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('API', () => {
  const app = createApp();

  it('reports liveness', async () => {
    const response = await request(app).get('/api/v1/health/live').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTypeOf('string');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('reports readiness', async () => {
    const response = await request(app).get('/api/v1/health/ready').expect(200);
    const body = response.body as {
      status: unknown;
      timestamp: unknown;
      uptimeSeconds: unknown;
    };

    expect(body).toMatchObject({ status: 'ready' });
    expect(body.timestamp).toBeTypeOf('string');
    expect(body.uptimeSeconds).toBeTypeOf('number');
  });

  it('preserves a valid caller request ID', async () => {
    const response = await request(app).get('/').set('x-request-id', 'test-request-id').expect(200);

    expect(response.headers['x-request-id']).toBe('test-request-id');
  });

  it('returns a consistent error envelope for unknown routes', async () => {
    const response = await request(app).get('/missing').expect(404);
    const body = response.body as { error: { requestId: unknown } };

    expect(body).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /missing was not found',
      },
    });
    expect(body.error.requestId).toBeTypeOf('string');
  });

  it('rejects untrusted browser origins', async () => {
    const response = await request(app)
      .get('/')
      .set('origin', 'https://untrusted.example')
      .expect(403);
    const body = response.body as { error: { code: unknown } };

    expect(body.error.code).toBe('CORS_ORIGIN_DENIED');
  });
});
