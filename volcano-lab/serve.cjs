const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Resolve from this file, never from the terminal's working directory.
const root = fs.realpathSync(__dirname);
const entry = path.join(root, 'index.html');
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Volcano-Lab-Root', encodeURIComponent(root));
  let route;
  try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }

  // Local diagnostic endpoint: make a stale preview copy easy to identify.
  if (route === '/__preview.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      project: 'Volcano Lab', root, entry, stylesheet: 'storybook.css',
      entrySha256: crypto.createHash('sha256').update(fs.readFileSync(entry)).digest('hex')
    }, null, 2));
    return;
  }
  if (route === '/favicon.ico') { res.writeHead(204).end(); return; }

  const target = path.resolve(root, '.' + (route === '/' ? '/index.html' : route));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(target, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.on('error', err => {
  console.error(`Cannot start Volcano Lab: ${err.message}`);
  if (err.code === 'EADDRINUSE') console.error('Port 4173 is already in use. Check http://127.0.0.1:4173/__preview.json before restarting the intended preview.');
  process.exitCode = 1;
});
server.listen(4173, '127.0.0.1', () => {
  console.log('VOLCANO LAB local preview: http://127.0.0.1:4173/');
  console.log(`Serving project: ${root}`);
  console.log(`Entry file: ${entry}`);
  console.log('Verify source: http://127.0.0.1:4173/__preview.json');
});
