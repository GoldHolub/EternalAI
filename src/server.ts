import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import { errorHandler } from './middleware/errorHandler.js';
import { IUserService } from './services/IUserService.js';
import { UserService } from './services/Impl/UserService.js';
import { UserRepository } from './repositories/Impl/UserRepository.js';
import { IUserRepository } from './repositories/IUserRepository';
import { createUserRouter } from './routes/UserRouter.js';

dotenv.config();
const app = express();
const PORT  = process.env.PORT || 3000;

app.use(cors());
app.use(errorHandler);
app.use(bodyParser.json());
app.use(passport.initialize());

const userRepository: IUserRepository = new UserRepository();
const userService: IUserService = new UserService(userRepository);
const userRouter = createUserRouter(userService);
app.use(userRouter);


app.listen(PORT, ()=> {
    console.log(`Server listening on port ${PORT}`);
});
