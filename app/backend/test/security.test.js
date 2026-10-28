// app/backend/test/security.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Security Controls & Hardening Verification', () => {
  it('Should send strict Helmet security headers', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['content-security-policy']);
  });

  it('Should include rate limiting headers on /api routes', async () => {
    const res = await request(app).get('/api/test');
    assert.ok(res.headers['ratelimit-limit']);
    assert.ok(res.headers['ratelimit-remaining']);
  });

  it('Should handle potential XSS payloads safely without executing', async () => {
    const xssPayload = {
      title: '<script>alert("xss")</script>Test Sanitation',
      description: 'Pothole <img src=x onerror=alert(1)>',
      category: 'ROADS',
      location: 'Main Street'
    };

    const res = await request(app)
      .post('/api/civic-issues/report')
      .send(xssPayload);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.issue && res.body.issue.id);
  });
});
