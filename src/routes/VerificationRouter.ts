import { Router } from 'express';
import passport from '../middleware/passport.js';
import { VerificationController } from '../controllers/VerificationController.js';

export function createVerificationRouter(): Router {
    const router = Router();
    const verificationController = new VerificationController();
    router.post('/verification/phone', verificationController.sendVerificationCode.bind(verificationController));
    return router;
}
