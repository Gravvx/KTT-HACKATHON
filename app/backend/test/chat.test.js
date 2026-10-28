// app/backend/test/chat.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../server');

describe('AI Citizen Assistant API', () => {
  it('POST /api/chat/message should answer civic grievance with actionable steps', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'There is a severe water pipeline leakage on MG Road.',
        language: 'en'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.reply);
    assert.ok(res.body.reply.length > 20);
    assert.ok(res.body.engine);
  });

  it('POST /api/chat/message should process Hindi query with Hindi response', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'सड़क पर बहुत बड़ा गड्ढा है, शिकायत कहाँ करें?',
        language: 'hi'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.reply);
    assert.strictEqual(res.body.language, 'hi');
  });

  it('POST /api/chat/message should maintain context across multi-turn history', async () => {
    const history = [
      { role: 'user', text: 'I live in South Delhi near Saket.' },
      { role: 'model', text: 'Noted! You are located in South Delhi, Saket zone under MCD.' }
    ];

    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'Who is the municipal commissioner or helpline for my area?',
        language: 'en',
        history: history
      });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.reply);
  });

  it('GET /api/chat/history should return chat transcript log', async () => {
    const res = await request(app).get('/api/chat/history');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.history));
  });
});
