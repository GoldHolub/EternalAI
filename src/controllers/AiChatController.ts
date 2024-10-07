import { Request, Response, NextFunction } from 'express';
import { IChatService } from '../services/IChatService.js';
import { Socket } from 'socket.io';


export class AiChatController {
    constructor(private chatService: IChatService) {
        this.chatService = chatService;
    }

    async unregisteredUserChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { questionId } = req.body;
            const response = await this.chatService.startFreeChat(questionId);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async userChat(socket: Socket, data: any): Promise<void> {
        try {
            const { questionId, characterId, message } = data;
            // @ts-ignore
            const  user = socket.request.user;
            const response = await this.chatService.startChat(user, characterId, message, questionId);
            socket.emit('chatResponse', response);
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    }

    async getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // @ts-ignore
            const  userId = req.user!.id;
            const individualId: number = parseInt(req.params.individualId);
            const page: number = parseInt(req.query.page as string) || 1;
            const pageSize: number = parseInt(req.query.pageSize as string) || 6;
            const chatHistory = await this.chatService.getChatHistory(userId, individualId, page, pageSize);
            res.status(200).json({ chatHistory });
        } catch (error) {
            next(error);
        }
    }
}



