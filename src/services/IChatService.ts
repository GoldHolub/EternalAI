
export interface IChatService {
    startFreeChat(questionId: number, characterId: number): Promise<string>;

    startChat(userId: number, characterId: number, message: string): Promise<string>;

    getChatHistory(userId: number, characterId: number): Promise<string>;

    getCharacterPrompt(characterId: number): Promise<string>;
}