import { CustomError } from './CustomError';

export class PaymentServiceError extends CustomError {
    constructor(message = 'Payment service encountered an error') {
        super(message);
    }
}
