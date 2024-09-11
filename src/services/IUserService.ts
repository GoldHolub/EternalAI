import { UserType } from "../models/users";

export interface IUserService {
    registerUser(userData: Omit<UserType, 'id' | 'name' |'phone' | 'created_at' | 'has_subscription' | 'role'>): Promise<UserType>;

    login(email: string, password: string): Promise<{ token: string } | null>;

    getUserById(id: number): Promise<UserType | null>;

    getUserByEmail(email: string): Promise<UserType | null>;

    updateUser(id: number, updates: Partial<Omit<UserType, 'id' | 'has_subscription' | 'role' | 'created_at'>>): Promise<UserType | null>;

    deleteUser(id: number): Promise<boolean>;

    getAllUsers(): Promise<UserType[]>;

    subscribeUser(userId: number): Promise<boolean>;

    isUserSubscribed(userId: number): Promise<boolean>;

    changeUserRole(userId: number, newRole: string): Promise<UserType | null>;
}