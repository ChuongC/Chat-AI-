import { db } from '../config/database.js';
import { chats } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { StreamChat } from 'stream-chat';
import { queryRag } from './ragService.js';

const chatClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
);

export async function getChatHistory(userId: string, conversationId?: string) {
    return db
        .select()
        .from(chats)
        .where(
            conversationId
                ? and(eq(chats.userId, userId), eq(chats.conversationId, conversationId))
                : eq(chats.userId, userId)
        )
        .orderBy(chats.createdAt);
}

export async function sendMessage(userId: string, message: string, conversationId?: string) {
    // Get AI response from RAG
    const aiMessage = await queryRag(message);

    // Persist to DB
    await db.insert(chats).values({
        userId,
        message,
        reply: aiMessage,
        ...(conversationId ? { conversationId } : {}),
    });

    // Push to Stream channel
    const channel = chatClient.channel('messaging', `chat-${userId}`, {
        name: 'AI Chat',
        created_by_id: 'ai_bot',
    } as any);
    
    await channel.create();              
    await channel.addMembers([userId]);
    await channel.sendMessage({ text: aiMessage, user_id: 'ai_bot' });

    return aiMessage;
}