import jwt from 'jsonwebtoken';
import { ITokenService } from '../ITokenService.js';

export class TokenService implements ITokenService {
    async generateVerificationToken(userId: number, email: string): Promise<string> {
        return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '3d' });
    }

    verifyToken(token: string): { userId: number, email: string } | null {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number, email: string };
            return payload;
        } catch (error) {
            console.error('Invalid token:', error);
            return null;
        }
    }

    verifySharedToken(token: string): { userId: number } | null {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
            return payload;
        } catch (error) {
            console.error('Invalid token:', error);
            return null;
        }
    }
}