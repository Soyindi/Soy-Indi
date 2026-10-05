import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import type { PresentationSlide, PresentationTheme } from './presentation/schemas';

// ============================================================================
// 1. USUARIOS Y AUTENTICACIÓN OFICIAL BETTER-AUTH
// ============================================================================
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  status: text('status', { enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED'] }).default('TRIAL').notNull(),
  trialEndsAt: integer('trial_ends_at', { mode: 'timestamp_ms' }),
  subscriptionEndsAt: integer('subscription_ends_at', { mode: 'timestamp_ms' }),
  aiCredits: integer('ai_credits').default(30).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);

// ============================================================================
// 2. TARJETAS DIGITALES PROFESIONALES (INDI CARDS)
// ============================================================================
export const cards = sqliteTable('cards', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  profession: text('profession').notNull(),
  about: text('about'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  emailContact: text('email_contact'),
  websiteUrl: text('website_url'),
  linkedinUrl: text('linkedin_url'),
  instagramUrl: text('instagram_url'),
  photoUrl: text('photo_url'),
  address: text('address'),
  themeConfig: text('theme_config', { mode: 'json' }).$type<{
    themeId: string;
    primaryColorOklch: string;
    backgroundColorOklch: string;
    particleBehavior: 'static' | 'interactive' | 'ambient';
    particleIntensity: 'subtle' | 'balanced' | 'prominent';
    fontFamily: string;
    enableGlassRefraction: boolean;
    badgeText?: string | null;
    ctaLabel?: string | null;
    cardFinish?: 'classic' | 'holographic' | 'titanium' | 'obsidian' | 'minimal';
    surfaceTexture?: 'none' | 'dot-grid' | 'radial-glow';
  }>().notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  clicksCount: integer('clicks_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('cards_user_idx').on(table.userId),
  index('cards_slug_idx').on(table.slug),
]);

export const cardEvents = sqliteTable('card_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cardId: text('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  eventType: text('event_type', {
    enum: ['view', 'contact_save', 'whatsapp_click', 'share', 'qr_scan'],
  }).notNull(),
  source: text('source').default('direct').notNull(),
  device: text('device').default('mobile').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
}, (table) => [
  index('card_events_card_idx').on(table.cardId),
  index('card_events_type_idx').on(table.eventType),
  index('card_events_created_idx').on(table.createdAt),
]);

// ============================================================================
// 3. CURRÍCULUMS INTELIGENTES (SMART CVS)
// ============================================================================
export const smartCvs = sqliteTable('smart_cvs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  targetRole: text('target_role').notNull(),
  atsScore: integer('ats_score').default(0).notNull(),
  content: text('content', { mode: 'json' }).$type<{
    fullName: string;
    email: string;
    phone: string;
    location: string;
    rut?: string;
    summary: string;
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      period: string;
      bullets: string[];
      detailedBullets?: Array<{ text: string; needs_metric: boolean }>;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      verifiedCredentialId?: string;
      credentialType?: 'DEGREE' | 'CERTIFICATION' | 'DIPLOMA' | 'UNVERIFIED';
    }>;
    references?: Array<{ name: string; role: string; company: string; contact?: string }>;
    credentials?: Array<{
      id: string;
      issuingInstitution: string;
      credentialName: string;
      issueDate?: string;
      verificationCode?: string;
      validationStatus: 'CRYPTOGRAPHIC_MATCH' | 'SEMANTIC_MATCH' | 'MANUAL_REVIEW';
    }>;
    linkedinUrl?: string;
    websiteUrl?: string;
    indiCardSlug?: string;
    signatureUrl?: string;
    signatureType?: 'DRAWN' | 'UPLOADED' | 'TYPOGRAPHIC' | 'NONE';
    signatureDate?: string;
  }>().notNull(),
  templateId: text('template_id').default('executive-modern').notNull(),
  slug: text('slug').unique(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('smart_cvs_user_idx').on(table.userId),
  index('smart_cvs_slug_idx').on(table.slug),
]);

// ============================================================================
// 4. PRESENTACIONES MULTI-AGENTE (ORBITAL PRESENTATIONS)
// ============================================================================
export const presentations = sqliteTable('presentations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false).notNull(),
  slidesData: text('slides_data', { mode: 'json' }).$type<PresentationSlide[]>().notNull(),
  themeSettings: text('theme_settings', { mode: 'json' }).$type<PresentationTheme>().notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('presentations_user_idx').on(table.userId),
  index('presentations_slug_idx').on(table.slug),
]);

// ============================================================================
// 5. HISTORIAL DE PAGOS Y SUSCRIPCIONES (MERCADO PAGO)
// ============================================================================
export const paymentsHistory = sqliteTable('payments_history', {
  id: text('id').primaryKey(), // Payment ID de Mercado Pago
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  planInterval: text('plan_interval', { enum: ['monthly', 'semiannual'] }).notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('CLP').notNull(),
  status: text('status').notNull(), // approved, pending, rejected
  paymentMethodId: text('payment_method_id'),
  externalReference: text('external_reference'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
}, (table) => [
  index('payments_history_user_idx').on(table.userId),
  index('payments_history_status_idx').on(table.status),
]);

// ============================================================================
// 6. RELACIONES DECLARATIVAS
// ============================================================================
export const userRelations = relations(user, ({ many }) => ({
  cards: many(cards),
  smartCvs: many(smartCvs),
  presentations: many(presentations),
  payments: many(paymentsHistory),
  sessions: many(session),
  accounts: many(account),
}));

export const paymentsHistoryRelations = relations(paymentsHistory, ({ one }) => ({
  user: one(user, {
    fields: [paymentsHistory.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  author: one(user, {
    fields: [cards.userId],
    references: [user.id],
  }),
  events: many(cardEvents),
}));

export const cardEventsRelations = relations(cardEvents, ({ one }) => ({
  card: one(cards, {
    fields: [cardEvents.cardId],
    references: [cards.id],
  }),
}));

export const smartCvsRelations = relations(smartCvs, ({ one }) => ({
  author: one(user, {
    fields: [smartCvs.userId],
    references: [user.id],
  }),
}));

export const presentationsRelations = relations(presentations, ({ one }) => ({
  author: one(user, {
    fields: [presentations.userId],
    references: [user.id],
  }),
}));
