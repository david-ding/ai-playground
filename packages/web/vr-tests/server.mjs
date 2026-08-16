import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const PORT = Number(process.env.VR_PORT ?? 4173);
const WEB_ROOT = resolve(import.meta.dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function sendFile(res, filePath) {
  const stat = statSync(filePath);
  res.writeHead(200, {
    'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': 'no-store',
  });
  res.end(readFileSync(filePath));
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/health') {
    res.writeHead(200);
    res.end('ok');
    return;
  }

  let filePath;
  if (pathname.startsWith('/fonts/')) {
    const rest = pathname.slice('/fonts/'.length);
    filePath = join(WEB_ROOT, 'fonts', rest);
  } else if (pathname.startsWith('/storybook/')) {
    const rest = pathname.slice('/storybook/'.length);
    filePath = join(WEB_ROOT, 'storybook-static', rest);
  } else if (pathname.startsWith('/web/')) {
    const rest = pathname.slice('/web/'.length);
    filePath = join(WEB_ROOT, 'dist', rest);
  } else if (pathname === '/') {
    filePath = join(WEB_ROOT, 'storybook-static', 'index.html');
  } else {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const normalized = normalize(filePath);
  if (!normalized.startsWith(WEB_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const stat = statSync(normalized);
    if (stat.isDirectory()) {
      sendFile(res, join(normalized, 'index.html'));
    } else {
      sendFile(res, normalized);
    }
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => {
  console.log(`vr static server listening on http://localhost:${PORT}`);
});
