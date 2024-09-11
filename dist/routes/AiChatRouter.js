import { Router } from 'express';
import passport from '../middleware/passport.js';
import { AiChatController } from '../controllers/AiChatController.js';
export function createAiChatRouter(chatService) {
    const router = Router();
    const aiChatController = new AiChatController(chatService);
    router.post('/api/freeChat', passport.authenticate('jwt', { session: false }), aiChatController.unregisteredUserChat.bind(aiChatController));
    return router;
}
//# sourceMappingURL=AiChatRouter.js.map