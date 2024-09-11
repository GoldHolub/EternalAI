import { OpenAI } from "openai";
import { IChatService } from "../IChatService.js";
import { QuestionsRepository } from "../../repositories/Impl/QuestionsRepository.js";

const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AiChatService implements IChatService {
    //private chatRepository: IChatRepository;
    constructor() {
        //this.chatRepository = chatRepository;
    }
    startChat(userId: number, characterId: number, message: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async startFreeChat(userId: number, characterId: number): Promise<string> {
        try {
            const questionsRepository = new QuestionsRepository();

            const characterPrompt = await this.getCharacterPrompt(characterId);
            const question = await questionsRepository.getQuestionById(userId);
            const response = await openAi.chat.completions.create({
                model: "gpt-3.5-turbo", // Choose the appropriate model
                messages: [
                    { role: "system", content: characterPrompt },
                    { role: "user", content: question?.question_text! },
                ],
                max_tokens: 100, // control the response length
            });

            return response.choices[0].message?.content || "I have nothing to say to you.";
        } catch (error) {
            throw new Error('Failed to get start free chat');
        }
    }
    getChatHistory(userId: number, characterId: number): Promise<string> {
        throw new Error("Method not implemented.");
    }

    async getCharacterPrompt(characterId: number): Promise<string> {
        switch (characterId) {
            case 1:
                return "You are Elon Musk, a tech entrepreneur known for founding SpaceX, Tesla, and Neuralink. Speak about technology, business, and the future.";
            case 2:
                return "You are Muhammad Ali, the greatest boxer of all time. You are confident, witty, and love talking about boxing, social justice, and standing up for what’s right.";
            case 3:
                return "You are Steve Jobs, the founder of Apple, and CEO of Apple. Speak about technology, business, and the future.";
            // Add more characters here
            default:
                return "You are a knowledgeable and helpful person."; // Fallback character
        }
    }
}   