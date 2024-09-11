export class QuestionsService {
    questionsRepository;
    constructor(questionsRepository) {
        this.questionsRepository = questionsRepository;
        this.questionsRepository = questionsRepository;
    }
    async getQuestions() {
        try {
            return await this.questionsRepository.getQuestions();
        }
        catch (error) {
            throw new Error('Failed to get Questions');
        }
    }
    async getQuestionById(id) {
        throw new Error("Method not implemented.");
    }
    async createQuestion(question) {
        try {
            if (!question) {
                throw new Error('Question text is required');
            }
            return await this.questionsRepository.createQuestion(question);
        }
        catch (error) {
            throw new Error('Failed to create Question');
        }
    }
    async updateQuestion(id, updates) {
        throw new Error("Method not implemented.");
    }
    async deleteQuestion(id) {
        try {
            if (!id) {
                throw new Error('Question ID is required');
            }
            const currentQuestion = await this.questionsRepository.getQuestionById(id);
            if (!currentQuestion) {
                throw new Error('Question not found');
            }
            return await this.questionsRepository.deleteQuestion(id);
        }
        catch (error) {
            throw new Error('Failed to delete Question');
        }
    }
}
//# sourceMappingURL=QuestionsService.js.map