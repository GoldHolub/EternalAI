import { CustomError } from './CustomError';

export class TokenServiceError extends CustomError {
    constructor(message = 'Token service encountered an error') {
        super(message);
    }
}
