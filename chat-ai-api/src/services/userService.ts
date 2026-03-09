import { db } from '../config/database.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { StreamChat } from 'stream-chat';

const { STREAM_API_KEY, STREAM_API_SECRET } = process.env;

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    throw new Error('Missing STREAM_API_KEY or STREAM_API_SECRET in environment variables');
}

const chatClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

export async function findUserById(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user ?? null;
}

/**
 * Upserts the user in both Stream and the database, then returns
 * a Stream token. Called once per mount, driven by the Frappe session.
 * The user never fills in a form.
 */
export async function autoRegisterFromFrappe(name: string, email: string) {
    const userId = email.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Upsert into Stream
    const { users: streamUsers } = await chatClient.queryUsers({ id: { $eq: userId } });
    if (!streamUsers.length) {
        await chatClient.upsertUser({ id: userId, name, email, role: 'user' } as any);
    }

    // Upsert into DB
    const existing = await findUserById(userId);
    if (!existing) {
        await db.insert(users).values({ userId, name, email });
    }

    const streamToken = chatClient.createToken(userId);
    return { userId, name, email, streamToken };
}