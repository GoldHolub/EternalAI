import { Router } from 'express';
import passport from '../middleware/passport.js';
import { AiChatController } from '../controllers/AiChatController.js';
export function createAiChatRouter(chatService) {
    const router = Router();
    const aiChatController = new AiChatController(chatService);
    router.post('/api/freeChat', aiChatController.unregisteredUserChat.bind(aiChatController));
    // router.post('/api/chat',
    //     passport.authenticate('jwt', { session: false }),
    //     aiChatController.userChat.bind(aiChatController));
    router.get('/api/chatHistory/:individualId', passport.authenticate('jwt', { session: false }), aiChatController.getChatHistory.bind(aiChatController));
    return router;
}
//# sourceMappingURL=AiChatRouter.js.map