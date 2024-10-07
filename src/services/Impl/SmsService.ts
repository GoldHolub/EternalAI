import { ISmsService } from "../ISmsService";
import twilio from 'twilio';

export class SmsService implements ISmsService {
    async sendSms(phoneNumber: string, message: string): Promise<string> {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_NUMBER,
            to: phoneNumber
        })
        return response.sid;
    }
    async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
        return true;
    }
}