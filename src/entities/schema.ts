import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import type { PresentationSlide, PresentationTheme } from './presentation/schemas';
import type { CardThemeConfig } from './card/schemas';
import type { CVContent } from './cv/schemas';

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
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  referralCode: text('referral_code').unique(),
  referredBy: text('referred_by'),
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
  themeConfig: text('theme_config', { mode: 'json' }).$type<CardThemeConfig>().notNull(),
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
  content: text('content', { mode: 'json' }).$type<CVContent | Record<string, any>>().notNull(),
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
// 6. PROGRAMA DE AFILIADOS Y PAGOS QUINCENALES
// ============================================================================
export const affiliateBankAccounts = sqliteTable('affiliate_bank_accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).unique().notNull(),
  bankName: text('bank_name').notNull(),
  accountType: text('account_type').notNull(),
  accountNumber: text('account_number').notNull(),
  rut: text('rut').notNull(),
  holderName: text('holder_name').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('affiliate_bank_accounts_user_idx').on(table.userId),
]);

export const affiliateCommissions = sqliteTable('affiliate_commissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  affiliateUserId: text('affiliate_user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  buyerUserId: text('buyer_user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  paymentId: text('payment_id').references(() => paymentsHistory.id, { onDelete: 'cascade' }).notNull(),
  amountClp: integer('amount_clp').notNull(),
  status: text('status', { enum: ['pending', 'payable', 'paid'] }).default('pending').notNull(),
  paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
}, (table) => [
  index('affiliate_commissions_affiliate_user_idx').on(table.affiliateUserId),
  index('affiliate_commissions_status_idx').on(table.status),
]);

// ============================================================================
// 7. RELACIONES DECLARATIVAS
// ============================================================================
export const userRelations = relations(user, ({ one, many }) => ({
  cards: many(cards),
  smartCvs: many(smartCvs),
  presentations: many(presentations),
  payments: many(paymentsHistory),
  sessions: many(session),
  accounts: many(account),
  bankAccount: one(affiliateBankAccounts, {
    fields: [user.id],
    references: [affiliateBankAccounts.userId],
  }),
  commissions: many(affiliateCommissions, {
    relationName: 'affiliateUserCommissions',
  }),
}));

export const affiliateBankAccountsRelations = relations(affiliateBankAccounts, ({ one }) => ({
  user: one(user, {
    fields: [affiliateBankAccounts.userId],
    references: [user.id],
  }),
}));

export const affiliateCommissionsRelations = relations(affiliateCommissions, ({ one }) => ({
  affiliateUser: one(user, {
    fields: [affiliateCommissions.affiliateUserId],
    references: [user.id],
    relationName: 'affiliateUserCommissions',
  }),
  buyerUser: one(user, {
    fields: [affiliateCommissions.buyerUserId],
    references: [user.id],
  }),
  payment: one(paymentsHistory, {
    fields: [affiliateCommissions.paymentId],
    references: [paymentsHistory.id],
  }),
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
