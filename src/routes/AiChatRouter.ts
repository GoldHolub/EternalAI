import { Router } from 'express';
import passport from '../middleware/passport.js';
import { AiChatController } from '../controllers/AiChatController.js';
import { IChatService } from '../services/IChatService.js';

export function createAiChatRouter(chatService: IChatService): Router {
    const router = Router();
    const aiChatController = new AiChatController(chatService);

    router.post('/api/freeChat',
        passport.authenticate('jwt', { session: false }),
        aiChatController.unregisteredUserChat.bind(aiChatController));

    return router;
}