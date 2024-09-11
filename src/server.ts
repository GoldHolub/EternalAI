import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import { errorHandler } from './middleware/errorHandler.js';
import { UserService } from './services/Impl/UserService.js';
import { UserRepository } from './repositories/Impl/UserRepository.js';
import { createUserRouter } from './routes/UserRouter.js';
import { createAiChatRouter } from './routes/AiChatRouter.js';
import { createQuestionsRouter } from './routes/QuestionsRouter.js';
import { AiChatService } from './services/Impl/AiChatService.js';
import { QuestionsService } from './services/Impl/QuestionsService.js';
import { QuestionsRepository } from './repositories/Impl/QuestionsRepository.js';

dotenv.config();
const app = express();
const PORT  = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

const userRouter = createUserRouter(new UserService(new UserRepository()));
const aiChatRouter = createAiChatRouter(new AiChatService());
const questionRouter = createQuestionsRouter(new QuestionsService(new QuestionsRepository()));

app.use(userRouter);
app.use(aiChatRouter);
app.use(questionRouter);

app.use(errorHandler);

app.listen(PORT, ()=> {
    console.log(`Server listening on port ${PORT}`);
});
