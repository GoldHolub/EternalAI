import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { createUserRouter } from './routes/UserRouter.js';
import { createAiChatRouter } from './routes/AiChatRouter.js';
import { createQuestionsRouter } from './routes/QuestionsRouter.js';
import { AiChatService } from './services/Impl/AiChatService.js';
import { QuestionsService } from './services/Impl/QuestionsService.js';
import { QuestionsRepository } from './repositories/Impl/QuestionsRepository.js';
import { createIndividualsRouter } from './routes/IndividualsRouter.js';
import { createVerificationRouter } from './routes/VerificationRouter.js';
import { createPaymentRouter } from './routes/PaymentRouter.js';
import { WebSocketService } from './services/WebSocketService.js';
import { createServer } from 'http';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const webSocketService = new WebSocketService(httpServer);

const questionRouter = createQuestionsRouter(new QuestionsService(new QuestionsRepository()));
const aiChatRouter = createAiChatRouter(new AiChatService());
const verificationRouter = createVerificationRouter();
const individualsRouter = createIndividualsRouter();
const paymentRouter = createPaymentRouter();
const userRouter = createUserRouter();

app.use(cors());
app.use('/webhook/stripe-payments', express.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use(userRouter);
app.use(aiChatRouter);
app.use(questionRouter);
app.use(individualsRouter);
app.use(verificationRouter);
app.use(paymentRouter);

app.use(errorHandler);

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
