import { Router } from 'express';
import passport from '../middleware/passport.js';
import { AiChatController } from '../controllers/AiChatController.js';
export const authenticateJWT = () => passport.authenticate('jwt', { session: false });
const router = Router();
export function createAiChatRouter(chatService) {
    const aiChatController = new AiChatController(chatService);
    router.post('/freeChat', aiChatController.unregisteredUserChat.bind(aiChatController));
    router.get('/chatHistory/:individualId', authenticateJWT(), aiChatController.getChatHistory.bind(aiChatController));
    return Router().use('/api', router);
}
//# sourceMappingURL=AiChatRouter.js.map