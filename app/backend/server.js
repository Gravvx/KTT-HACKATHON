// app/backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const localDb = require('./utils/localDb');

const app = express();

// Security and Logging Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root Route — Friendly Welcome & Frontend Portal Redirect
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CivicConnect API Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; margin: 0; padding: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; text-align: center; }
        .card { background: #111; border: 2px solid #a3ff00; padding: 30px; max-width: 650px; width: 100%; box-shadow: 6px 6px 0px #a3ff00; text-align: left; }
        h1 { color: #a3ff00; margin-top: 0; font-size: 26px; }
        .badge { background: #a3ff00; color: #000; font-weight: bold; padding: 3px 8px; font-size: 11px; text-transform: uppercase; }
        .btn { display: inline-block; background: #a3ff00; color: #000; text-decoration: none; font-weight: bold; padding: 12px 24px; border: 2px solid #000; box-shadow: 3px 3px 0px #fff; margin-top: 15px; font-size: 14px; text-transform: uppercase; }
        .btn:hover { background: #8de000; }
        code { background: #222; color: #00d2ff; padding: 2px 6px; font-size: 13px; }
        ul { padding-left: 20px; line-height: 1.8; color: #ccc; }
        a { color: #00d2ff; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">● Online & Operational</span>
        <h1>⚡ CivicConnect API Server</h1>
        <p>The backend server is running successfully on <code>port ${process.env.PORT || 5000}</code>.</p>
        <p>To use the full CivicConnect website, open the <strong>Frontend Application</strong>:</p>
        <a href="http://localhost:5173" class="btn" target="_blank">Open Frontend (http://localhost:5173) ➔</a>
        <h3 style="color:#fff; margin-top:25px; margin-bottom:5px; font-size:14px; text-transform:uppercase;">Active API Endpoints:</h3>
        <ul>
          <li><strong>Civic Issue Resolving:</strong> <code>GET /api/civic-issues</code> | <code>POST /api/civic-issues/report</code></li>
          <li><strong>AI Assistant:</strong> <code>POST /api/chat/message</code> (Gemini / Civic AI Engine)</li>
          <li><strong>Welfare Services:</strong> <code>GET /api/services</code> | <code>POST /api/services/apply</code></li>
          <li><strong>Translation:</strong> <code>POST /api/translate/text</code></li>
          <li><strong>Server Health:</strong> <a href="/health"><code>/health</code></a> | <a href="/api/test"><code>/api/test</code></a></li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Mounted API Routes
app.use('/api/civic-issues', require('./routes/civicIssues')); // Civic Problem Resolving & Tracking
app.use('/api/chat', require('./routes/chat'));                 // AI Citizen Assistant (Gemini / Civic AI Engine)
app.use('/api/services', require('./routes/services'));         // Welfare Services & Applications
app.use('/api/translate', require('./routes/translate'));       // Text Translation API
app.use('/api/auth', require('./routes/auth'));                 // Citizen Auth API

// Test & Health routes
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CivicConnect Backend is fully operational!',
    storage: 'Local File System (JSON)',
    aiEngine: process.env.GEMINI_API_KEY ? 'Google Gemini 2.0/1.5 Flash' : 'CivicConnect Intelligent Civic Engine',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    storage: 'local-json',
  });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, hint: 'Visit http://localhost:5000 for server dashboard or http://localhost:5173 for web app' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack || err);
  res.status(500).json({ error: 'Internal server error occurred' });
});

// Start server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`⚡ CivicConnect Backend active on: http://localhost:${PORT}`);
    console.log(`📁 Local Data Storage: app/backend/data/ (JSON files)`);
    console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini API' : 'Built-in Civic AI Resolver'}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
