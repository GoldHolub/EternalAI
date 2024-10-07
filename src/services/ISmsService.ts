
export interface ISmsService {
    sendVerificationCode: (phoneNumber: string, code: string) => Promise<boolean>
    sendSms: (phoneNumber: string, message: string) => Promise<string>
}