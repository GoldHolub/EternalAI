import { UserType } from "../models/users";

export interface IUserService {
    registerUser(email?: string, password?: string, name?: string, googleToken?: string, sharedToken?: string): Promise<{ token: string } | null>;

    login(email?: string, password?: string, googleToken?: string): Promise<{ token: string, isVerified: boolean } | null>;

    getUserById(id: number): Promise<UserType | null>;

    getUserByEmail(email: string): Promise<UserType | null>;

    updateUser(user: UserType, updates: Partial<Omit<UserType, 'id' | 'has_subscription' | 'role' | 'created_at'>>): Promise<UserType | null>;

    deleteUser(id: number): Promise<boolean>;

    getAllUsers(): Promise<UserType[]>;

    subscribeUser(userId: number): Promise<boolean>;

    isUserSubscribed(userId: number): Promise<boolean>;

    changeUserRole(userId: number, newRole: string): Promise<UserType | null>;

    verifyUserEmailToken(token: string): Promise<string | undefined>;

    sendForgottenPasswordEmail(email: string): Promise<boolean>;

    resetForgottenPassword(token: string, newPassword: string): Promise<boolean>;

    giveFreeAnswersToUser(sharedToken: string | undefined): Promise<void>;
}