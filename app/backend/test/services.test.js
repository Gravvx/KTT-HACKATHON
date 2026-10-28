// app/backend/test/services.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Welfare Services & Government Schemes API', () => {
  it('GET /api/services should return official welfare schemes list', async () => {
    const res = await request(app).get('/api/services');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.services && Array.isArray(res.body.services));
    assert.ok(res.body.services.length >= 4);

    const first = res.body.services[0];
    assert.ok(first.name);
    assert.ok(first.category);
    assert.ok(first.officialPortalUrl);
  });

  it('GET /api/services/:id should return single scheme metadata', async () => {
    const res = await request(app).get('/api/services/social_security');
    assert.strictEqual(res.statusCode, 200);
    assert.match(res.body.name, /Social Security/i);
    assert.ok(res.body.eligibility);
    assert.ok(res.body.steps);
  });

  it('POST /api/services/apply should register citizen application with tracking ID', async () => {
    const application = {
      serviceId: 'social_security',
      applicantName: 'Test Citizen',
      phone: '9876543210',
      aadhaarLast4: '9876',
      address: '123 Test Nagar, New Delhi'
    };

    const res = await request(app)
      .post('/api/services/apply')
      .send(application);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.application);
    assert.ok(res.body.application.id);
    assert.strictEqual(res.body.application.applicantName, 'Test Citizen');
  });

  it('GET /api/services/applications should list submitted applications', async () => {
    const res = await request(app).get('/api/services/applications?phone=9876543210');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.applications));
    assert.ok(res.body.applications.some(a => a.phone === '9876543210'));
  });
});
