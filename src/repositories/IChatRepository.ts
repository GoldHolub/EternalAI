import { ChatType } from "../models/chat";
import { MessageType } from "../models/message";

export interface IChatRepository {
    createNewChat(userId: number, individualId: number): Promise<ChatType>;

    getChatHistory(userId: number, individualId: number, offset: number, limit: number): Promise<MessageType[]>;

    createMessage(userId: number, individualId: number, sender: string, content: string, ): Promise<MessageType>;

    getTotalMessagesCount(userId: number, characterId: number): Promise<number>;
}
