
export interface ITokenService {
    generateVerificationToken(userId: number, email: string): Promise<string>;

    verifyToken(token: string): { userId: number, email: string } | null;

    verifySharedToken(token: string): { userId: number } | null;
}