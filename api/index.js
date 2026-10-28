// api/index.js
// Vercel Serverless Function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// Mounted Routes
app.use('/api/civic-issues', require('../app/backend/routes/civicIssues'));
app.use('/api/chat', require('../app/backend/routes/chat'));
app.use('/api/services', require('../app/backend/routes/services'));
app.use('/api/translate', require('../app/backend/routes/translate'));
app.use('/api/auth', require('../app/backend/routes/auth'));

app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CivicConnect Serverless Backend active on Vercel',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'vercel' });
});

module.exports = app;
