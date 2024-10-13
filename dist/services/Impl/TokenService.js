import jwt from 'jsonwebtoken';
export class TokenService {
    async generateVerificationToken(userId, email) {
        return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '3d' });
    }
    verifyToken(token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            return payload;
        }
        catch (error) {
            console.error('Invalid token:', error);
            return null;
        }
    }
    verifySharedToken(token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            return payload;
        }
        catch (error) {
            console.error('Invalid token:', error);
            return null;
        }
    }
}
//# sourceMappingURL=TokenService.js.map