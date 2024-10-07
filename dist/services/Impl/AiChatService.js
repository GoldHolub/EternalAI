import { OpenAI } from "openai";
import { QuestionsRepository } from "../../repositories/Impl/QuestionsRepository.js";
import { IndividualsRepository } from "../../repositories/Impl/IndividualsRepository.js";
import { ChatRepository } from "../../repositories/Impl/ChatRepository.js";
import { UserRepository } from "../../repositories/Impl/UserRepository.js";
const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const questionsRepository = new QuestionsRepository();
const individualsRepository = new IndividualsRepository();
const chatRepository = new ChatRepository();
const userRepository = new UserRepository();
export class AiChatService {
    //private chatRepository: IChatRepository;
    constructor() {
        //this.chatRepository = chatRepository;
    }
    async startChat(user, individualId, message, questionId) {
        try {
            if (!message && !questionId) {
                throw new Error('Message or questionId is required');
            }
            if (message && !individualId) {
                throw new Error('IndividualId is required');
            }
            if (!user.has_subscription && user.textAnswers >= 5) {
                throw new Error('Please subscribe to use this feature');
            }
            const individual = individualId ? await individualsRepository.getIndividualById(individualId)
                : await this.getRandomIndividual();
            if (!individual) {
                throw new Error('Character not found');
            }
            const chatMessages = await chatRepository.getChatHistory(user.id, individual.id, 0, 100);
            if (chatMessages.length === 0) {
                await chatRepository.createNewChat(user.id, individual.id);
            }
            const conversationHistory = chatMessages.map(chatMessage => {
                return {
                    role: chatMessage.sender === 'user' ? 'user' : 'assistant',
                    content: chatMessage.content
                };
            });
            const userMessage = message || (await questionsRepository.getQuestionById(questionId))?.question_text;
            conversationHistory.push({ role: 'user', content: userMessage });
            const newUserMessage = await chatRepository.createMessage(user.id, individual.id, 'user', userMessage);
            const characterPrompt = individual?.prompt;
            const response = await openAi.chat.completions.create({
                model: "gpt-3.5-turbo", // Choose the appropriate model
                messages: [
                    { role: "system", content: characterPrompt },
                    ...conversationHistory
                ],
                max_tokens: 60, // control the response length
            });
            const responseMessage = response.choices[0].message?.content || "I have nothing to say to you.";
            const newResponseMessage = await chatRepository.createMessage(user.id, individual.id, 'individual', responseMessage);
            if (message)
                userRepository.updateUser(user.id, { textAnswers: ++user.textAnswers });
            return { response: responseMessage, individualId: individual.id };
        }
        catch (error) {
            throw new Error(`Failed to get start chat: ${error.message}`);
        }
    }
    async startFreeChat(userId) {
        try {
            const individual = await this.getRandomIndividual();
            const characterPrompt = individual?.prompt;
            const question = await questionsRepository.getQuestionById(userId);
            const response = await openAi.chat.completions.create({
                model: "gpt-3.5-turbo", // Choose the appropriate model
                messages: [
                    { role: "system", content: characterPrompt },
                    { role: "user", content: question?.question_text },
                ],
                max_tokens: 60, // control the response length
            });
            const responseMessage = response.choices[0].message?.content || "I have nothing to say to you.";
            return { response: responseMessage, individualId: individual.id };
        }
        catch (error) {
            throw new Error(`Failed to get start free chat: ${error.message}`);
        }
    }
    async getChatHistory(userId, characterId, page, pageSize) {
        try {
            if (!characterId) {
                throw new Error('characterId is required');
            }
            const chatRepository = new ChatRepository();
            const offset = (page - 1) * pageSize;
            const chatMessages = await chatRepository.getChatHistory(userId, characterId, offset, pageSize);
            const totalMessagesCount = await chatRepository.getTotalMessagesCount(userId, characterId);
            const totalPages = Math.ceil(totalMessagesCount / pageSize);
            return {
                chat: chatMessages.map(message => ({ sender: message.sender, content: message.content })),
                totalPages,
                currentPage: page
            };
        }
        catch (error) {
            throw new Error(`Failed to get chat history: ${error.message}`);
        }
    }
    async getRandomIndividual() {
        try {
            const individuals = await individualsRepository.getIndividuals({ offset: 0, limit: 20 });
            const randomIndex = Math.floor(Math.random() * individuals.length);
            if (!individuals[randomIndex]) {
                throw new Error('Character not found');
            }
            return individuals[randomIndex];
        }
        catch (error) {
            throw new Error(`Failed to get random individual: ${error.message}`);
        }
    }
}
//# sourceMappingURL=AiChatService.js.map