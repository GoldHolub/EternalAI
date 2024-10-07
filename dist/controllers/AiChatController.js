export class AiChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
        this.chatService = chatService;
    }
    async unregisteredUserChat(req, res, next) {
        try {
            const { questionId } = req.body;
            const response = await this.chatService.startFreeChat(questionId);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async userChat(socket, data) {
        try {
            const { questionId, characterId, message } = data;
            // @ts-ignore
            const user = socket.request.user;
            const response = await this.chatService.startChat(user, characterId, message, questionId);
            socket.emit('chatResponse', response);
        }
        catch (error) {
            socket.emit('error', { message: error.message });
        }
    }
    async getChatHistory(req, res, next) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const individualId = parseInt(req.params.individualId);
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 6;
            const chatHistory = await this.chatService.getChatHistory(userId, individualId, page, pageSize);
            res.status(200).json({ chatHistory });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=AiChatController.js.map