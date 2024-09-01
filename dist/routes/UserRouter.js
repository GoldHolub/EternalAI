import { Router } from 'express';
import passport from '../middleware/passport.js';
import { UserController } from '../controllers/UserController.js';
export function createUserRouter(userService) {
    const router = Router();
    const userController = new UserController(userService);
    router.post('/user/register', userController.registerUser.bind(userController));
    router.post('/user/login', userController.login.bind(userController));
    router.get('/user/profile', passport.authenticate('jwt', { session: false }), userController.getUserById.bind(userController));
    router.put('/user/profile', passport.authenticate('jwt', { session: false }), userController.updateUser.bind(userController));
    return router;
}
//# sourceMappingURL=UserRouter.js.map