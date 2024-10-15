import { CustomError } from './CustomError';

export class IndividualServiceError extends CustomError {
    constructor(message = 'Individual service encountered an error') {
        super(message);
    }
}
