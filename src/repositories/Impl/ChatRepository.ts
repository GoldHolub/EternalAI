import { ChatType } from "../../models/chat.js";
import { MessageType } from "../../models/message.js";
import { IChatRepository } from "../IChatRepository.js";
import { db } from "../../database/postgresDB.js";
import { and, eq, sql } from "drizzle-orm";
import { chats, messages } from "../../database/schema.js";

export class ChatRepository implements IChatRepository {
    async createNewChat(userId: number, individualId: number): Promise<ChatType> {
        try {
            const [newChat] = await db.insert(chats).values({
                user_id: userId,
                individual_id: individualId,
                is_active: true,
                created_at: new Date(),
            }).returning();

            return newChat;
        } catch (error: any) {
            console.error('Error creating chat into database:', error.message);
            throw error;
        }
    }

    async getChatHistory(userId: number, individualId: number, offset: number, limit: number): Promise<MessageType[]> {
        try {
            const chatMessages = await db.select().from(messages)
                .where(and(eq(messages.user_id, userId), eq(messages.individual_id, individualId)))
                .orderBy(messages.created_at)
                .offset(offset)
                .limit(limit);

            return chatMessages;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    }

    async getTotalMessagesCount(userId: number, characterId: number): Promise<number> {
        try {
            const [{ count }] = await db.select({ count: sql`COUNT(*)` })
                .from(messages)
                .where(and(eq(messages.user_id, userId), eq(messages.individual_id, characterId)));
    
            return Number(count);
        } catch (error) {
            console.error('Error fetching total messages count:', error);
            throw error;
        }
    }

    async createMessage(userId: number, individualId: number, sender: string, content: string): Promise<MessageType> {
        try {
            const [newMessage] = await db.insert(messages).values({
                user_id: userId,
                individual_id: individualId,
                sender: sender,
                content: content,
                created_at: new Date(),
            }).returning();

            return newMessage;
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }

}