import { db } from '../config/database.js';
import { conversations, chats } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export function getConversationsByUser(userId: string) {
    return db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, userId))
        .orderBy(conversations.createdAt);
}

export async function createConversation(userId: string, name?: string) {
    const [conversation] = await db
        .insert(conversations)
        .values({ userId, name: name?.trim() || 'New Conversation' })
        .returning();
    return conversation;
}

export async function renameConversation(userId: string, conversationId: string, name: string) {
    const [updated] = await db
        .update(conversations)
        .set({ name: name.trim() })
        .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
        .returning();
    return updated ?? null;
}

export async function deleteConversation(userId: string, conversationId: string) {
    // Remove associated chats first (FK constraint)
    await db
        .delete(chats)
        .where(and(eq(chats.conversationId, conversationId), eq(chats.userId, userId)));

    const [deleted] = await db
        .delete(conversations)
        .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
        .returning();

    return deleted ?? null;
}