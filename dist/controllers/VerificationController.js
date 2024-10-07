import { SmsService } from "../services/Impl/SmsService.js";
export class VerificationController {
    async sendVerificationCode(req, res, next) {
        try {
            const smsService = new SmsService();
            const { phoneNumber, code } = req.body;
            const result = await smsService.sendSms(phoneNumber, code);
            res.status(200).json({ result });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=VerificationController.js.map