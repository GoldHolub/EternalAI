export class QuestionController {
    questionService;
    constructor(questionService) {
        this.questionService = questionService;
        this.questionService = questionService;
    }
    async getQuestions(req, res, next) {
        try {
            const questions = await this.questionService.getQuestions();
            res.status(200).json(questions.map((question) => ({
                questionId: question.id,
                question: question.question_text
            })));
        }
        catch (error) {
            next(error);
        }
    }
    async createQuestion(req, res, next) {
        try {
            const question = req.body.question;
            const newQuestion = await this.questionService.createQuestion(question);
            res.status(201).json({ questionId: newQuestion.id, question: newQuestion.question_text });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteQuestion(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const isDeleted = await this.questionService.deleteQuestion(id);
            res.status(200).json({ deleted: isDeleted });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=QuestionController.js.map