require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express    = require('express');
const path       = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app    = express();
const PORT   = process.env.PORT    || 3000;
const GO_API = `http://localhost:${process.env.GO_PORT || 8080}`;

// ── Proxy all /api/* and /health to the Go server ─────────────
app.use(['/api', '/health'], createProxyMiddleware({
  target:       GO_API,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.status(502).json({ message: 'API server unavailable' });
    },
  },
}));

// ── Static assets ─────────────────────────────────────────────
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));
app.use('/css',    express.static(path.join(__dirname, '../client/css')));
app.use('/js',     express.static(path.join(__dirname, '../client/js')));
app.use('/admin',  express.static(path.join(__dirname, '../client/pages/admin')));
app.use(           express.static(path.join(__dirname, '../client/pages/user')));

// ── SPA fallback ──────────────────────────────────────────────
app.get('*', (req, res) => {
  const file = req.path.startsWith('/admin')
    ? path.join(__dirname, '../client/pages/admin', path.basename(req.path))
    : path.join(__dirname, '../client/pages/user/index.html');
  res.sendFile(file, err => {
    if (err) res.sendFile(path.join(__dirname, '../client/pages/user/404.html'));
  });
});

app.listen(PORT, () => {
  console.log(`Static server  → http://localhost:${PORT}`);
  console.log(`Go API proxy   → ${GO_API}`);
});
