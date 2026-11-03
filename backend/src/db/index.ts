import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  KV: KVNamespace;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
