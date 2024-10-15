import { CustomError } from './CustomError';

export class SubscriptionServiceError extends CustomError {
    constructor(message = 'Subscription service encountered an error') {
        super(message);
    }
}
