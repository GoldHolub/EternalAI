import { QuestionController } from "../controllers/QuestionController.js";
import { Router } from "express";
import passport from "passport";
export function createQuestionsRouter(questionsService) {
    const router = Router();
    const questionsController = new QuestionController(questionsService);
    router.get('/individuals/questions', passport.authenticate('jwt', { session: false }), questionsController.getQuestions.bind(questionsController));
    router.post('/individuals/questions', passport.authenticate('jwt', { session: false }), questionsController.createQuestion.bind(questionsController));
    router.delete('/individuals/questions/:id', passport.authenticate('jwt', { session: false }), questionsController.deleteQuestion.bind(questionsController));
    // router.get('/questions/:id', questionsController.getQuestionById.bind(questionsController));
    // router.put('/questions/:id', questionsController.updateQuestion.bind(questionsController));
    return router;
}
//# sourceMappingURL=QuestionsRouter.js.map