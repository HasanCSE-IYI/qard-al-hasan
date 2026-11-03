import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import app from './index';
import { createLocalD1, createLocalR2, createLocalKV } from './local-d1';

const PORT = 8787;
const DB_FILE = path.join(__dirname, '..', 'local-qard.db');
const MEDIA_DIR = path.join(__dirname, '..', '.local-media');

async function startServer() {
  console.log('🕊️  Starting Qard al-Hasan Cloudflare Worker Dev Server...');

  const db = createLocalD1(DB_FILE);
  const mediaBucket = createLocalR2(MEDIA_DIR);
  const kv = createLocalKV();

  // D1 initial schema execution
  const schemaPath = path.join(__dirname, '..', 'drizzle', '0000_initial_schema.sql');
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(sql);
    console.log('✅ Cloudflare D1 local schema synced successfully.');
  }

  const env = {
    DB: db,
    MEDIA_BUCKET: mediaBucket,
    KV: kv,
    ENVIRONMENT: 'development',
    JWT_SECRET: 'qard-al-hasan-super-secret-jwt-key-2026',
  };

  // Node HTTP Server forwarding native requests to Hono app
  const server = http.createServer(async (req, res) => {
    try {
      const url = `http://${req.headers.host || '127.0.0.1:8787'}${req.url}`;
      const method = req.method || 'GET';

      // Read request body
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = ['GET', 'HEAD'].includes(method) ? undefined : Buffer.concat(chunks);

      const headers = new Headers();
      for (const [key, val] of Object.entries(req.headers)) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else if (val) {
          headers.set(key, String(val));
        }
      }

      const webRequest = new Request(url, {
        method,
        headers,
        body,
      });

      const response = await app.fetch(webRequest, env as any);

      res.statusCode = response.status;
      response.headers.forEach((v, k) => {
        res.setHeader(k, v);
      });

      const resBuffer = await response.arrayBuffer();
      res.end(Buffer.from(resBuffer));
    } catch (err: any) {
      console.error('Server Request Error:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Qard al-Hasan Cloudflare Worker running at: http://127.0.0.1:${PORT}`);
    console.log(`📡 Health check endpoint: http://127.0.0.1:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start dev server:', err);
});
