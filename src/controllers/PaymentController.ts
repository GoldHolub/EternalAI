import { ne } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/Impl/PaymentService.js';
import { UserType } from '../models/users.js';

const paymentService = new PaymentService();

export class PaymentController {
    async createSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const user: UserType = req.user! as UserType;
            const { paymentMethodId } = req.body;
            const response = await paymentService.createSubscription(user, paymentMethodId);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const user: UserType = req.user! as UserType;
            const { paymentMethodId } = req.body;
            const response = await paymentService.updateSubscription(user, paymentMethodId);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async cancelSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const user: UserType = req.user! as UserType;
            const response = await paymentService.cancelSubscription(user);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async renewSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const user: UserType = req.user! as UserType;
            const response = await paymentService.renewSubscription(user);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async handlePaymentResponse(req: Request, res: Response, next: NextFunction) {
        try {
            const sig: string  | string[] = req.headers['stripe-signature']!;
            const payload = req.body;
            if (!sig) {
                return res.status(400).send('Missing Stripe signature');
            }
            
            await paymentService.handlePaymentResponse(payload, sig);
            res.status(200).json({ received: true }); 
        } catch (error) {
            next(error);
        }
    }
}