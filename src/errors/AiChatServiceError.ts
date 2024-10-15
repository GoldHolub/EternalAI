import { CustomError } from './CustomError';

export class AiChatServiceError extends CustomError {
    constructor(message = 'AI Chat service encountered an error') {
        super(message);
    }
}
