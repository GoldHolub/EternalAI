import { QuestionType } from "../models/questions";

export interface IQuestionsService {
    getQuestions(): Promise<QuestionType[]>;

    getQuestionById(id: number): Promise<QuestionType | null>;

    createQuestion(question: string): Promise<QuestionType>;

    updateQuestion(id: number, updates: Partial<QuestionType>): Promise<QuestionType | null>;

    deleteQuestion(id: number): Promise<boolean>;
}