export interface IEmailService {
    sendVerificationEmail(email: string, token: string): Promise<void>;

    sendPasswordResetEmail(email: string, token: string): Promise<void>;

    sendPaymentSuccessEmail(email: string): Promise<void>;
}
