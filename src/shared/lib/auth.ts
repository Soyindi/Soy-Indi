import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/shared/api/db';
import * as schema from '@/entities/schema';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'https://soyindi.cl',
  trustedOrigins: [
    'https://soyindi.cl',
    'https://www.soyindi.cl',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
  ],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
          const cleanName = (userData.name || 'user')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 10);
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const referralCode = (userData as any).referralCode || `${cleanName || 'indi'}-${randomSuffix}`;

          return {
            data: {
              ...userData,
              status: (userData as any).status || 'TRIAL',
              trialEndsAt: (userData as any).trialEndsAt || new Date(Date.now() + threeDaysMs),
              role: (userData as any).role || 'user',
              referralCode,
            },
          };
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos de caché en el Edge
    },
  },
});
