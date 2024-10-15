import { CustomError } from './CustomError';

export class EmailServiceError extends CustomError {
    constructor(message = 'Email service encountered an error') {
        super(message);
    }
}
