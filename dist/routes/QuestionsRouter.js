import { QuestionController } from "../controllers/QuestionController.js";
import { Router } from "express";
import { authenticateJWT } from "./AiChatRouter.js";
export function createQuestionsRouter(questionsService) {
    const router = Router();
    const questionsController = new QuestionController(questionsService);
    router.get('/questions', questionsController.getQuestions.bind(questionsController));
    router.post('/questions', authenticateJWT(), questionsController.createQuestion.bind(questionsController));
    router.delete('/questions/:id', authenticateJWT(), questionsController.deleteQuestion.bind(questionsController));
    return Router().use('/individuals', router);
}
//# sourceMappingURL=QuestionsRouter.js.map