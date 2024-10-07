import { Router } from 'express';
import { VerificationController } from '../controllers/VerificationController.js';
export function createVerificationRouter() {
    const router = Router();
    const verificationController = new VerificationController();
    router.post('/verification/phone', verificationController.sendVerificationCode.bind(verificationController));
    return router;
}
//# sourceMappingURL=VerificationRouter.js.map