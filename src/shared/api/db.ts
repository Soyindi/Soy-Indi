import dotenv from 'dotenv';
if (typeof process !== 'undefined' && process.env) {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
}
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@/entities/schema';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken: url.startsWith('file:') ? undefined : authToken,
});

export const db = drizzle(client, { schema });
