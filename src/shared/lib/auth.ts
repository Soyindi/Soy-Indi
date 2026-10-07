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
  user: {
    additionalFields: {
      status: { type: 'string', required: false, defaultValue: 'TRIAL' },
      trialEndsAt: { type: 'date', required: false },
      subscriptionEndsAt: { type: 'date', required: false },
      aiCredits: { type: 'number', required: false, defaultValue: 30 },
      role: { type: 'string', required: false, defaultValue: 'user' },
      referralCode: { type: 'string', required: false },
      referredBy: { type: 'string', required: false },
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

          // Atribución nativa en el servidor si viene la cookie indi_ref_code
          let referredBy = (userData as any).referredBy || null;
          if (!referredBy) {
            try {
              const { headers } = await import('next/headers');
              const headerList = await headers();
              const cookieHeader = headerList.get('cookie') || '';
              const match = cookieHeader.match(/indi_ref_code=([^;]+)/);
              const refCode = match ? decodeURIComponent(match[1].trim()) : null;

              if (refCode) {
                const { eq } = await import('drizzle-orm');
                const { normalizeEmailForAntiGaming } = await import('@/entities/affiliate/schemas');
                const referrer = await db.query.user.findFirst({
                  where: eq(schema.user.referralCode, refCode),
                });
                if (referrer?.id) {
                  // Guardrail Anti-Gaming 2026: Comprobar que no sea auto-referido con correos alias
                  const isSameEmail =
                    userData.email &&
                    referrer.email &&
                    normalizeEmailForAntiGaming(userData.email) === normalizeEmailForAntiGaming(referrer.email);

                  if (!isSameEmail) {
                    referredBy = referrer.id;
                  }
                }
              }
            } catch {
              // Fuera de contexto de request (ej. scripts o tests locales)
            }
          }

          return {
            data: {
              ...userData,
              status: (userData as any).status || 'TRIAL',
              trialEndsAt: (userData as any).trialEndsAt || new Date(Date.now() + threeDaysMs),
              role: (userData as any).role || 'user',
              referralCode,
              ...(referredBy ? { referredBy } : {}),
            },
          };
        },
        after: async (createdUser) => {
          // Garantía de persistencia atómica post-creación en Turso SQLite
          try {
            if (createdUser && createdUser.id) {
              const { eq } = await import('drizzle-orm');
              const currentInDb = await db.query.user.findFirst({
                where: eq(schema.user.id, createdUser.id),
              });

              if (currentInDb && (!currentInDb.referralCode || (createdUser as any).referredBy && !currentInDb.referredBy)) {
                const updates: Record<string, any> = {};
                if (!currentInDb.referralCode && (createdUser as any).referralCode) {
                  updates.referralCode = (createdUser as any).referralCode;
                }
                if (!currentInDb.referredBy && (createdUser as any).referredBy) {
                  updates.referredBy = (createdUser as any).referredBy;
                }
                if (Object.keys(updates).length > 0) {
                  await db.update(schema.user).set(updates).where(eq(schema.user.id, createdUser.id));
                }
              }
            }
          } catch (err) {
            console.error('Error en hook post-creación de usuario:', err);
          }
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
