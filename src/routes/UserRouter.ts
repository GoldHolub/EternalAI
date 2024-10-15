import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticateJWT } from './AiChatRouter.js';

export function createUserRouter(): Router {
    const router = Router();
    const userController = new UserController();

    router.post('/register', userController.registerUser.bind(userController));
    router.post('/login', userController.login.bind(userController));
    router.post('/verify-email', userController.verifyUserEmailToken.bind(userController));

    router.post('/forgotten-pass', userController.sendForgottenPasswordEmail.bind(userController));
    router.post('/reset-pass', userController.resetForgottenPassword.bind(userController));

    router.get('/profile', authenticateJWT(), userController.getUserById.bind(userController));
    router.put('/ternsOfPolicy', authenticateJWT(), userController.updateTernsOfPolicy.bind(userController));
    router.put('/profile', authenticateJWT(), userController.updateUser.bind(userController));
    router.get('/check-token', authenticateJWT(), userController.checkToken.bind(userController));

    return Router().use('/user', router);
}
