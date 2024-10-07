import { PaymentService } from '../services/Impl/PaymentService.js';
const paymentService = new PaymentService();
export class PaymentController {
    async createSubscription(req, res, next) {
        try {
            const user = req.user;
            const { paymentMethodId } = req.body;
            const response = await paymentService.createSubscription(user, paymentMethodId);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateSubscription(req, res, next) {
        try {
            const user = req.user;
            const { paymentMethodId } = req.body;
            const response = await paymentService.updateSubscription(user, paymentMethodId);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async cancelSubscription(req, res, next) {
        try {
            const user = req.user;
            const response = await paymentService.cancelSubscription(user);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async renewSubscription(req, res, next) {
        try {
            const user = req.user;
            const response = await paymentService.renewSubscription(user);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async handlePaymentResponse(req, res, next) {
        try {
            const sig = req.headers['stripe-signature'];
            const payload = req.body;
            if (!sig) {
                return res.status(400).send('Missing Stripe signature');
            }
            await paymentService.handlePaymentResponse(payload, sig);
            res.status(200).json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=PaymentController.js.map