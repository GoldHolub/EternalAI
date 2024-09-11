import { Request, Response, NextFunction } from 'express';
import { IQuestionsService } from '../services/IQuestionsService';
import { QuestionType } from '../models/questions';

export class QuestionController {
    constructor(private questionService: IQuestionsService) {
        this.questionService = questionService;
    }

    async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const questions: QuestionType[] = await this.questionService.getQuestions();

            res.status(200).json(questions.map((question) => ({
                questionId: question.id,
                question: question.question_text
            })));
        } catch (error) {
            next(error);
        }
    }

    async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const question: string = req.body.question;
            const newQuestion = await this.questionService.createQuestion(question);

            res.status(201).json({ questionId: newQuestion.id, question: newQuestion.question_text });
        } catch (error) {
            next(error);
        }
    }

    async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: number = parseInt(req.params.id);
            const isDeleted = await this.questionService.deleteQuestion(id);

            res.status(200).json({ deleted: isDeleted });
        } catch (error) {
            next(error);
        }
    }
}