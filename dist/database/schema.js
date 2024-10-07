import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, varchar, primaryKey, foreignKey, boolean } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    name: text('name'),
    phone: text('phone').unique(),
    role: varchar('role', { length: 50 }).default('user').notNull(),
    has_subscription: boolean('has_subscription').notNull().default(false),
    textAnswers: integer('text_answers').default(0).notNull(),
    isVerified: boolean('is_verified').notNull().default(false),
    isGoogleVerified: boolean('is_google_verified').notNull().default(false),
    isSubscriptionCanceled: boolean('is_subscription_canceled').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
export const individuals = pgTable('individuals', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    title: text('title').notNull(),
    prompt: text('prompt').notNull(),
    smallImagePath: varchar('small_image_path', { length: 500 }).notNull(),
    fullImagePath: varchar('full_image_path', { length: 500 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
export const chats = pgTable('chats', {
    user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    individual_id: integer('individual_id').references(() => individuals.id, { onDelete: 'cascade' }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    is_active: boolean('is_active').default(true).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.user_id, t.individual_id] }),
}));
export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').notNull(),
    individual_id: integer('individual_id').notNull(),
    sender: varchar('sender', { length: 10 }).notNull(), // 'user' or 'character'
    content: text('content').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    fk: foreignKey({
        columns: [t.user_id, t.individual_id],
        foreignColumns: [chats.user_id, chats.individual_id],
    }).onUpdate('cascade').onDelete('cascade'),
}));
export const subscriptions = pgTable('subscriptions', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    start_date: timestamp('start_date').defaultNow().notNull(),
    end_date: timestamp('end_date'),
    is_active: boolean('is_active').notNull().default(true),
});
export const questions = pgTable('questions', {
    id: serial('id').primaryKey(),
    question_text: text('question_text').notNull().unique(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
export const userQuestions = pgTable('user_questions', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    question_id: integer('question_id').references(() => questions.id, { onDelete: 'cascade' }),
    asked_at: timestamp('asked_at').defaultNow().notNull(),
});
export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    payment_date: timestamp('payment_date').defaultNow().notNull(),
    subscription_id: integer('subscription_id').references(() => subscriptions.id),
});
export const usersRelations = relations(users, ({ many }) => ({
    subscriptions: many(subscriptions),
    userQuestions: many(userQuestions),
    payments: many(payments),
    chats: many(chats),
}));
export const individualsRelations = relations(individuals, ({ many }) => ({
    chats: many(chats),
}));
export const chatsRelations = relations(chats, ({ one, many }) => ({
    messages: many(messages),
    user: one(users, {
        fields: [chats.user_id],
        references: [users.id],
    }),
    character: one(individuals, {
        fields: [chats.individual_id],
        references: [individuals.id],
    }),
}));
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    user: one(users, {
        fields: [subscriptions.user_id],
        references: [users.id]
    }),
}));
export const messagesRelations = relations(messages, ({ one }) => ({
    chat: one(chats, {
        fields: [messages.user_id, messages.individual_id],
        references: [chats.user_id, chats.individual_id],
    }),
}));
export const userQuestionsRelations = relations(userQuestions, ({ one }) => ({
    user: one(users, {
        fields: [userQuestions.user_id],
        references: [users.id]
    }),
    question: one(questions, {
        fields: [userQuestions.question_id],
        references: [questions.id]
    }),
}));
export const paymentsRelations = relations(payments, ({ one }) => ({
    user: one(users, {
        fields: [payments.user_id],
        references: [users.id]
    }),
    subscription: one(subscriptions, {
        fields: [payments.subscription_id],
        references: [subscriptions.id]
    }),
}));
//# sourceMappingURL=schema.js.map