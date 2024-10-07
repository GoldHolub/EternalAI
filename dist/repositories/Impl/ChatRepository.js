import { db } from "../../database/postgresDB.js";
import { and, eq, sql } from "drizzle-orm";
import { chats, messages } from "../../database/schema.js";
export class ChatRepository {
    async createNewChat(userId, individualId) {
        try {
            const [newChat] = await db.insert(chats).values({
                user_id: userId,
                individual_id: individualId,
                is_active: true,
                created_at: new Date(),
            }).returning();
            return newChat;
        }
        catch (error) {
            console.error('Error creating chat into database:', error.message);
            throw error;
        }
    }
    async getChatHistory(userId, individualId, offset, limit) {
        try {
            const chatMessages = await db.select().from(messages)
                .where(and(eq(messages.user_id, userId), eq(messages.individual_id, individualId)))
                .orderBy(messages.created_at)
                .offset(offset)
                .limit(limit);
            return chatMessages;
        }
        catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    }
    async getTotalMessagesCount(userId, characterId) {
        try {
            const [{ count }] = await db.select({ count: sql `COUNT(*)` })
                .from(messages)
                .where(and(eq(messages.user_id, userId), eq(messages.individual_id, characterId)));
            return Number(count);
        }
        catch (error) {
            console.error('Error fetching total messages count:', error);
            throw error;
        }
    }
    async createMessage(userId, individualId, sender, content) {
        try {
            const [newMessage] = await db.insert(messages).values({
                user_id: userId,
                individual_id: individualId,
                sender: sender,
                content: content,
                created_at: new Date(),
            }).returning();
            return newMessage;
        }
        catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=ChatRepository.js.map