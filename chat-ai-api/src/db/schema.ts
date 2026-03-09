import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// ── Conversations 
export const conversations = pgTable('conversations', {
    id:        uuid('id').defaultRandom().primaryKey(),
    userId:    text('user_id').notNull(),
    name:      text('name').notNull().default('New Conversation'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─ Chats 
export const chats = pgTable('chats', {
    id:             serial('id').primaryKey(),
    userId:         text('user_id').notNull(),
    conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
    message:        text('message').notNull(),
    reply:          text('reply').notNull(),
    createdAt:      timestamp('created_at').defaultNow().notNull(),
});

// ── Users 
export const users = pgTable('users', {
    userId:    text('user_id').primaryKey(),
    name:      text('name').notNull(),
    email:     text('email').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Type inference for drizzle queries ─
export type ChatInsert = typeof chats.$inferInsert;
export type ChatSelect = typeof chats.$inferSelect;

export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;

export type ConversationInsert = typeof conversations.$inferInsert;
export type ConversationSelect = typeof conversations.$inferSelect;