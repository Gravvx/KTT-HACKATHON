// app/backend/test/health.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../server');

describe('System Health & Core Endpoints', () => {
  it('GET / should return 200 OK with server dashboard HTML', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.statusCode, 200);
    assert.match(res.text, /CivicConnect API Server/);
    assert.match(res.headers['content-type'], /html/);
  });

  it('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.strictEqual(res.body.storage, 'local-json');
  });

  it('GET /api/test should return 200 with operational metadata', async () => {
    const res = await request(app).get('/api/test');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
    assert.strictEqual(res.body.storage, 'Local File System (JSON)');
  });

  it('GET non-existent route should return 404 with standard error contract', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.error, 'Route not found');
  });
});
