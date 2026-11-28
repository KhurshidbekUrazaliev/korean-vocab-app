import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const base = '/inkday/';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

/** Serve the production artifact with Pages' extensionless HTML and real custom 404. */
export async function servePages() {
  const notFound = await readFile(resolve(dist, '404.html'));
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname.startsWith(base)) {
        let file = resolve(dist, pathname.slice(base.length) || 'index.html');
        if (!extname(file)) file += '.html';
        if (file.startsWith(resolve(dist) + sep)) {
          const body = await readFile(file);
          res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body);
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/html' }).end(notFound);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        res.writeHead(404, { 'Content-Type': 'text/html' }).end(notFound);
      } else {
        res.writeHead(500).end();
      }
    }
  });
  await new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', done);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}${base}`,
    close: () => server.close(),
  };
}
