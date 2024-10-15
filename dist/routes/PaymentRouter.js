import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import bodyParser from 'body-parser';
import { authenticateJWT } from './AiChatRouter.js';
const paymentController = new PaymentController();
export function createPaymentRouter() {
    const router = Router();
    router.post('/payment/create-subscription', authenticateJWT(), paymentController.createSubscription.bind(paymentController));
    router.put('/payment/update-subscription', authenticateJWT(), paymentController.updateSubscription.bind(paymentController));
    router.put('/payment/renew-subscription', authenticateJWT(), paymentController.renewSubscription.bind(paymentController));
    router.delete('/payment/cancel-subscription', authenticateJWT(), paymentController.cancelSubscription.bind(paymentController));
    router.post('/webhook/stripe-payments', bodyParser.raw({ type: 'application/json' }), paymentController.handlePaymentResponse.bind(paymentController));
    return router;
}
//# sourceMappingURL=PaymentRouter.js.map