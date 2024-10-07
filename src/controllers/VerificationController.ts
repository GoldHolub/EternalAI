import { Request, Response, NextFunction } from 'express';
import { SmsService } from "../services/Impl/SmsService.js";

export class VerificationController {

    async sendVerificationCode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try { 
            const smsService = new SmsService();
            const { phoneNumber, code } = req.body;
            const result = await smsService.sendSms(phoneNumber, code);
            res.status(200).json({ result });
        } catch (error) {
            next(error);
        }
    }
}