import twilio from 'twilio';
export class SmsService {
    async sendSms(phoneNumber, message) {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_NUMBER,
            to: phoneNumber
        });
        return response.sid;
    }
    async sendVerificationCode(phoneNumber, code) {
        return true;
    }
}
//# sourceMappingURL=SmsService.js.map