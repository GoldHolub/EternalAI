import { Router } from 'express';
import passport from '../middleware/passport.js';
import { UserController } from '../controllers/UserController.js';

export function createUserRouter(): Router {
    const router = Router();
    const userController = new UserController();

    router.post('/user/register', userController.registerUser.bind(userController));
    router.post('/user/login', userController.login.bind(userController));
    router.post('/user/verify-email', userController.verifyUserEmailToken.bind(userController));

    router.post('/user/forgotten-pass', userController.sendForgottenPasswordEmail.bind(userController));
    router.post('/user/reset-pass', userController.resetForgottenPassword.bind(userController));

    router.get('/user/profile',
        passport.authenticate('jwt', { session: false }),
        userController.getUserById.bind(userController));

    router.put('/user/ternsOfPolicy', 
        passport.authenticate('jwt', { session: false }),
        userController.updateTernsOfPolicy.bind(userController));    

    router.put('/user/profile',
        passport.authenticate('jwt', { session: false }),
        userController.updateUser.bind(userController));

    router.get('/user/check-token',
        passport.authenticate('jwt', { session: false }),
        userController.checkToken.bind(userController));

    return router;
}