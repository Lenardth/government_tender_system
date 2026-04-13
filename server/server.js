/**
 * server.js — Node.js static file server + API.
 *
 * Auth routes (/api/auth/*) are handled directly by Node.js/MySQL.
 * All other /api/* calls are proxied to the Go API on GO_PORT (default 8080).
 * If Go is not running, non-auth API calls return 502 gracefully.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const path    = require('path');
const cors    = require('cors');

const authRoutes   = require('./routes/auth');
const tenderRoutes = require('./routes/tenders');
const userRoutes   = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ──────────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ── API routes (Node.js handles these directly) ─────────────── */
app.use('/api/auth',    authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/users',   userRoutes);

/* ── Static assets ───────────────────────────────────────────── */
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));
app.use('/css',    express.static(path.join(__dirname, '../client/css')));
app.use('/js',     express.static(path.join(__dirname, '../client/js')));
app.use('/admin',  express.static(path.join(__dirname, '../client/pages/admin')));
app.use(           express.static(path.join(__dirname, '../client/pages/user')));

/* ── SPA fallback ────────────────────────────────────────────── */
app.get('*', (req, res) => {
  const isAdmin = req.path.startsWith('/admin');
  const file = isAdmin
    ? path.join(__dirname, '../client/pages/admin', path.basename(req.path))
    : path.join(__dirname, '../client/pages/user/index.html');
  res.sendFile(file, err => {
    if (err) res.sendFile(path.join(__dirname, '../client/pages/user/404.html'));
  });
});

/* ── Error handler ───────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`\n✓ Server running → http://localhost:${PORT}\n`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    const next = Number(PORT) + 1;
    console.warn(`⚠  Port ${PORT} in use — trying ${next}…`);
    server.close();
    app.listen(next, () => {
      console.log(`\n✓ Server running → http://localhost:${next}\n`);
    });
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
