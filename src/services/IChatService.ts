import { IndividualsType } from "../models/individuals.js";
import { UserType } from "../models/users.js";
import { PaginationOptions } from "../models/paginationOptions.js";
import { ChatHistoryResponseDto } from "../models/dto/chatHistoryResponseDto.js";

export interface IChatService {
    startFreeChat(questionId: number): Promise<{ response: string, individualId: number }>;

    startChat(user: any, characterId: number, message?: string, questionId?: number): Promise<{ response: string, individualId: number, responseCount: number }>;

    getChatHistory(user: number, characterId: number, page: number, pageSize: number): Promise<ChatHistoryResponseDto>;
}