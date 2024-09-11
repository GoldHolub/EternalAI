import { IQuestionsService } from "../IQuestionsService.js";
import { QuestionType } from "../../models/questions.js";
import { IQuestionsRepository } from "../../repositories/IQuestionsRepository.js";

export class QuestionsService implements IQuestionsService {

    constructor(private questionsRepository: IQuestionsRepository) {
        this.questionsRepository = questionsRepository;
    }

    async getQuestions(): Promise<QuestionType[]> {
        try {
            return await this.questionsRepository.getQuestions();
        } catch (error) {
            throw new Error('Failed to get Questions');
        }
    }

    async getQuestionById(id: number): Promise<QuestionType | null> {
        throw new Error("Method not implemented.");
    }

    async createQuestion(question: string): Promise<QuestionType> {
        try {
            if (!question) {
                throw new Error('Question text is required');
            }
            return await this.questionsRepository.createQuestion(question);
        } catch (error) {
            throw new Error('Failed to create Question');
        }
    }

    async updateQuestion(id: number, updates: Partial<QuestionType>): Promise<QuestionType | null> {
        throw new Error("Method not implemented.");
    }

    async deleteQuestion(id: number): Promise<boolean> {
        try {
            if (!id) {
                throw new Error('Question ID is required');
            }

            const currentQuestion = await this.questionsRepository.getQuestionById(id);
            if (!currentQuestion) {
                throw new Error('Question not found');
            }

            return await this.questionsRepository.deleteQuestion(id);
        } catch (error) {
            throw new Error('Failed to delete Question');
        }
    }
}