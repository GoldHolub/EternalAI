import { Request, Response, NextFunction } from 'express';
import { IChatService } from '../services/IChatService.js';


export class AiChatController {
    constructor(private chatService: IChatService) {
        this.chatService = chatService;
    }

    async unregisteredUserChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { questionId, characterId } = req.body;
            const response = await this.chatService.startFreeChat(questionId, characterId);
            res.status(200).json({ response });
        } catch (error) {
            next(error);
        }
    }
}



