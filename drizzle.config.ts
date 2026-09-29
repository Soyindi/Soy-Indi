import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/entities/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  },
  verbose: true,
  strict: true,
});
