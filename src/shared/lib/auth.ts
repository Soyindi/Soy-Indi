import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/shared/api/db';
import * as schema from '@/entities/schema';

export const auth = betterAuth({
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
          const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
          return {
            data: {
              ...userData,
              status: (userData as any).status || 'TRIAL',
              aiCredits: (userData as any).aiCredits ?? 30,
              trialEndsAt: (userData as any).trialEndsAt || new Date(Date.now() + fifteenDaysMs),
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
