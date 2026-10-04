import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { defineConfig } from 'drizzle-kit';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const isTurso = url.startsWith('libsql:') || url.startsWith('https:');

export default defineConfig({
  dialect: isTurso ? 'turso' : 'sqlite',
  schema: './src/entities/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url,
    ...(isTurso && process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {}),
  },
  verbose: true,
  strict: true,
});

