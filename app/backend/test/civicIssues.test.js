// app/backend/test/civicIssues.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Civic Issues & Grievances API', { concurrency: 1 }, () => {
  it('GET /api/civic-issues should return list of active issues', async () => {
    const res = await request(app).get('/api/civic-issues');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.issues));
    assert.ok(res.body.issues.length > 0);
    assert.ok(res.body.issues[0].title);
    assert.ok(res.body.issues[0].category);
  });

  it('GET /api/civic-issues with category filter should return filtered results', async () => {
    const res = await request(app).get('/api/civic-issues?category=ROADS');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.issues));
  });

  it('Full lifecycle: Report, Fetch by ID, and Upvote a civic issue', async () => {
    const newIssue = {
      title: 'Automated Lifecycle Test: Broken streetlight near Park',
      description: 'Streetlight is flickering and poses safety concern at night.',
      category: 'ELECTRICITY',
      location: 'Civil Lines, Ward 14',
      coordinates: {
        lat: 28.6139,
        lng: 77.2090
      },
      urgency: 'High'
    };

    // 1. Report Issue
    const reportRes = await request(app)
      .post('/api/civic-issues/report')
      .send(newIssue);

    assert.strictEqual(reportRes.statusCode, 200);
    assert.strictEqual(reportRes.body.success, true);
    assert.ok(reportRes.body.issue);
    const createdId = reportRes.body.issue.id;
    assert.ok(createdId);

    // 2. Fetch by ID
    const fetchRes = await request(app).get(`/api/civic-issues/${createdId}`);
    assert.strictEqual(fetchRes.statusCode, 200);
    assert.strictEqual(fetchRes.body.success, true);
    assert.strictEqual(fetchRes.body.issue.id, createdId);

    // 3. Upvote
    const initialUpvotes = fetchRes.body.issue.upvotes || 0;
    const upvoteRes = await request(app).post(`/api/civic-issues/${createdId}/upvote`);
    assert.strictEqual(upvoteRes.statusCode, 200);
    assert.strictEqual(upvoteRes.body.success, true);
    assert.strictEqual(upvoteRes.body.upvotes, initialUpvotes + 1);
  });

  it('POST /api/civic-issues/report should reject submission without title', async () => {
    const res = await request(app)
      .post('/api/civic-issues/report')
      .send({ description: 'No title provided', category: 'ROADS', location: 'Delhi' });

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.error);
  });
});
