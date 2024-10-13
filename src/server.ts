import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
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
import { AiChatController } from './controllers/AiChatController.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

import jwt from 'jsonwebtoken';
import { UserRepository } from './repositories/Impl/UserRepository.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token; // JWT passed through auth field in handshake
        //const token: string = socket.handshake.headers.auth as string;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        jwt.verify(token, process.env.JWT_SECRET!, async (err: any, decoded: any) => {
            const userRepository = new UserRepository();
            if (err) {
                return next(new Error('Authentication error'));
            }
            const user = await userRepository.getUserById(decoded.userId);
            if (!user || !user.isVerified) {
                return next(new Error('Authentication error'));
            }
            // @ts-ignore
            socket.request.user = user;
            next();
        });
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');

    // Handle events
    socket.on('userChat', async (data) => {
        try {
            const aiChatController = new AiChatController(new AiChatService());
            await aiChatController.userChat(socket, data);
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const userRouter = createUserRouter();
const aiChatRouter = createAiChatRouter(new AiChatService());
const questionRouter = createQuestionsRouter(new QuestionsService(new QuestionsRepository()));
const individualsRouter = createIndividualsRouter();
const verificationRouter = createVerificationRouter();
const paymentRouter = createPaymentRouter();

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