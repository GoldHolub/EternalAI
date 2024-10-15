import { CustomError } from './CustomError';

export class SmsServiceError extends CustomError {
    constructor(message = 'SMS service encountered an error') {
        super(message);
    }
}
