import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import { errorHandler } from './middleware/errorHandler.js';
import { UserService } from './services/Impl/UserService.js';
import { UserRepository } from './repositories/Impl/UserRepository.js';
import { createUserRouter } from './routes/UserRouter.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(errorHandler);
app.use(bodyParser.json());
app.use(passport.initialize());
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userRouter = createUserRouter(userService);
app.use(userRouter);
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map