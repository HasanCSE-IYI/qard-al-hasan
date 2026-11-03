// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Cloudflare D1 Database Shim backed by Node.js 24 native SQLite (node:sqlite)
 * Full double-entry and D1 API compatibility without external workerd dependencies
 */
export function createLocalD1(dbFilePath: string = ':memory:'): D1Database {
  const db = new DatabaseSync(dbFilePath);

  // Enable WAL mode and foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  return {
    prepare(query: string) {
      return {
        _query: query,
        _params: [] as any[],
        bind(...params: any[]) {
          const bound = Object.create(this);
          bound._params = params;
          return bound;
        },
        async all() {
          const stmt = db.prepare(this._query);
          const results = stmt.all(...this._params);
          return {
            results: results as any[],
            success: true,
            meta: { duration: 0, changes: 0, last_row_id: 0, rows_read: results.length, rows_written: 0 },
          };
        },
        async get() {
          const stmt = db.prepare(this._query);
          const result = stmt.get(...this._params);
          return result as any;
        },
        async run() {
          const stmt = db.prepare(this._query);
          const info = stmt.run(...this._params);
          return {
            results: [],
            success: true,
            meta: {
              duration: 0,
              changes: Number(info.changes),
              last_row_id: Number(info.lastInsertRowid),
              rows_read: 0,
              rows_written: Number(info.changes),
            },
          };
        },
        async raw() {
          const stmt = db.prepare(this._query);
          const rows = stmt.all(...this._params) as Record<string, any>[];
          return rows.map((r) => Object.values(r));
        },
      } as any;
    },

    async batch<T = unknown>(statements: any[]): Promise<any[]> {
      db.exec('BEGIN TRANSACTION;');
      try {
        const results = [];
        for (const stmt of statements) {
          const s = db.prepare(stmt._query);
          if (stmt._query.trim().toUpperCase().startsWith('SELECT')) {
            results.push({ results: s.all(...stmt._params), success: true });
          } else {
            const info = s.run(...stmt._params);
            results.push({
              success: true,
              meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) },
            });
          }
        }
        db.exec('COMMIT;');
        return results;
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    },

    async exec(query: string) {
      db.exec(query);
      return { count: 0, duration: 0 };
    },

    dump() {
      throw new Error('dump not implemented in dev shim');
    },
  } as unknown as D1Database;
}

/**
 * Cloudflare R2 Bucket Shim backed by local directory
 */
export function createLocalR2(storageDir: string): R2Bucket {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  return {
    async put(key: string, value: any, options?: any) {
      const fullPath = path.join(storageDir, key);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const buffer = Buffer.from(value);
      fs.writeFileSync(fullPath, buffer);
      return {
        key,
        size: buffer.byteLength,
        etag: 'local-etag',
        httpEtag: 'local-etag',
      } as any;
    },

    async get(key: string) {
      const fullPath = path.join(storageDir, key);
      if (!fs.existsSync(fullPath)) return null;

      const buffer = fs.readFileSync(fullPath);
      return {
        key,
        size: buffer.byteLength,
        httpEtag: 'local-etag',
        body: buffer,
        writeHttpMetadata(headers: Headers) {
          headers.set('content-type', 'image/webp');
        },
      } as any;
    },

    async delete(key: string) {
      const fullPath = path.join(storageDir, key);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    },
  } as unknown as R2Bucket;
}

/**
 * Cloudflare KV Namespace Shim backed by Memory Map
 */
export function createLocalKV(): KVNamespace {
  const store = new Map<string, string>();
  return {
    async get(key: string) {
      return store.get(key) || null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    async delete(key: string) {
      store.delete(key);
    },
  } as unknown as KVNamespace;
}
