/**
 * Minimal static + API-stub server for Lighthouse CI.
 *
 * CI has no backend, so the SPA's boot-time fetches (GET /api/posts on the
 * feed, etc.) would fail with ERR_CONNECTION_REFUSED and log browser console
 * errors — which fails the strict `errors-in-console` / best-practices gate
 * for reasons that have nothing to do with app quality. This server serves
 * the built `dist/` and answers every /api request with a valid, empty JSON
 * payload so Lighthouse measures the real UI, not backend absence.
 *
 * Usage: node scripts/lhci-server.mjs   (PORT env var, default 4173)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PORT = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.br': 'application/octet-stream',
};

// A benign, shape-agnostic payload: components that read `posts`, `data`,
// `user`, etc. all get a defined value and no code path throws.
const EMPTY_OK = {
  success: true,
  posts: [],
  reels: [],
  jams: [],
  data: [],
  items: [],
  alerts: [],
  drafts: [],
  notifications: [],
  organizations: [],
  conversations: [],
  channels: [],
  user: null,
  total: 0,
  hasMore: false,
  page: 1,
};

function sendJson(res, body, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

function handleApiRequest(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  if (req.method !== 'GET') {
    return sendJson(res, { success: true });
  }

  if (urlPath.startsWith('/api/auth/me') || urlPath.startsWith('/api/users/me')) {
    return sendJson(res, { success: true, user: null });
  }
  if (urlPath.startsWith('/api/auth')) {
    return sendJson(res, { success: true });
  }
  if (urlPath.startsWith('/api/notifications')) {
    return sendJson(res, { success: true, notifications: [], total: 0, unreadCount: 0 });
  }
  if (urlPath.startsWith('/api/posts')) {
    return sendJson(res, { success: true, posts: [], total: 0, hasMore: false });
  }
  if (urlPath.startsWith('/api/reels')) {
    return sendJson(res, { success: true, reels: [], total: 0, hasMore: false });
  }
  if (urlPath.startsWith('/api/jams')) {
    return sendJson(res, { success: true, jams: [], total: 0, hasMore: false });
  }
  if (urlPath.startsWith('/api/search')) {
    return sendJson(res, { success: true, results: [], total: 0 });
  }
  if (urlPath.startsWith('/api/trending')) {
    return sendJson(res, { success: true, trending: [], hashtags: [] });
  }
  if (urlPath.startsWith('/api/users')) {
    return sendJson(res, { success: true, users: [], total: 0 });
  }
  if (urlPath.startsWith('/api/feed')) {
    return sendJson(res, { success: true, posts: [], reels: [], jams: [], total: 0, hasMore: false });
  }
  if (urlPath.startsWith('/api/organizations')) {
    return sendJson(res, { success: true, organizations: [], total: 0 });
  }

  return sendJson(res, EMPTY_OK);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  if (urlPath.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  // Resolve the request inside dist/ only — never escape the directory.
  const candidate = path.normalize(path.join(DIST, urlPath));
  if (candidate.startsWith(DIST) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return sendFile(res, candidate);
  }

  // SPA fallback: client-side routes (/login, /register, ...) get the shell.
  return sendFile(res, path.join(DIST, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`LHCI server listening on http://localhost:${PORT}`);
});