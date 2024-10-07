import { Router } from 'express';
import passport from '../middleware/passport.js';
import { PaymentController } from '../controllers/PaymentController.js';
import bodyParser from 'body-parser';

const paymentController = new PaymentController();

export function createPaymentRouter(): Router {
    const router = Router();

    router.post('/payment/create-subscription', 
        passport.authenticate('jwt', { session: false }), 
        paymentController.createSubscription.bind(paymentController)
    );

    router.put('/payment/update-subscription',  
        passport.authenticate('jwt', { session: false }), 
        paymentController.updateSubscription.bind(paymentController)
    );

    router.put('/payment/renew-subscription',  
        passport.authenticate('jwt', { session: false }), 
        paymentController.renewSubscription.bind(paymentController)
    );

    router.delete('/payment/cancel-subscription', 
        passport.authenticate('jwt', { session: false }), 
        paymentController.cancelSubscription.bind(paymentController)
    );

    router.post('/webhook/stripe-payments', 
        bodyParser.raw({ type: 'application/json' }),
        paymentController.handlePaymentResponse.bind(paymentController));
    
    return router;
}
