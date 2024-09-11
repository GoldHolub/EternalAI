export class AiChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
        this.chatService = chatService;
    }
    async unregisteredUserChat(req, res, next) {
        try {
            const { questionId, characterId } = req.body;
            const response = await this.chatService.startFreeChat(questionId, characterId);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=AiChatController.js.map