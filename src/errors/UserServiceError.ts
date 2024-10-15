import { CustomError } from './CustomError';

export class UserServiceError extends CustomError {
    constructor(message = 'User service encountered an error') {
        super(message);
    }
}
