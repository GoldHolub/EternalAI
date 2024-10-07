import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
export class EmailService {
    async sendVerificationEmail(email, token) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const subject = 'EthernalAI - Email Verification';
        const htmlTemplate = fs.readFileSync(path.join('./htmlTemplates', 'emailTemplate.html'), 'utf-8');
        await this.sendEmail(email, subject, htmlTemplate, verificationUrl);
        console.log(`Sending verification email to ${email}`);
        return;
    }
    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/password?token=${resetToken}`;
        const subject = 'EthernalAI - Reset Your Password';
        const htmlTemplate = fs.readFileSync(path.join('./htmlTemplates', 'passwordResetTemplate.html'), 'utf-8');
        await this.sendEmail(email, subject, htmlTemplate, resetUrl);
        console.log(`Sending password recovery email to ${email}`);
        return;
    }
    async sendPaymentSuccessEmail(email) {
        const subject = 'EthernalAI - Payment Successful';
        const currentDate = new Date().toLocaleDateString();
        const htmlTemplate = fs.readFileSync(path.join('./htmlTemplates', 'paymentBillTemplate.html'), 'utf-8');
        const updatedHtmlTemplate = htmlTemplate
            .replace('{{currentDate}}', currentDate)
            .replace('{{userEmail}}', email);
        await this.sendEmail(email, subject, updatedHtmlTemplate);
        console.log(`Sending bill to email ${email}`);
        return;
    }
    async sendEmail(email, subject, htmlTemplate, verificationUrl) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: { user: process.env.USER_EMAIL, pass: process.env.USER_PASSWORD, }
        });
        const logoPath = path.join('./uploads/EthernalAiLogo.png');
        const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
        const logoMimeType = 'image/png';
        if (verificationUrl) {
            htmlTemplate = htmlTemplate.replace('{{verificationUrl}}', verificationUrl);
        }
        htmlTemplate = htmlTemplate.replace('{{logoUrl}}', `data:${logoMimeType};base64,${logoBase64}`);
        const mailOptions = {
            to: email,
            subject: subject,
            html: htmlTemplate,
            attachments: [{ filename: 'logo.png', path: logoPath, cid: 'logoImage' }]
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(`Error: ${error.message}`);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
        return;
    }
}
//# sourceMappingURL=EmailService.js.map