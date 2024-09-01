import { UserType } from "../models/users";

export interface IUserRepository {
    createUser(user: Omit<UserType, 'id' | 'phone' | 'role' | 'has_subscription' |'created_at'>): Promise<UserType>;

    getUserById(id: number): Promise<UserType | null>;

    getUserByEmail(email: string): Promise<UserType | null>;

    updateUser(id: number, updates: Partial<Omit<UserType, 'id' | 'created_at'>>): Promise<UserType | null>;

    deleteUser(id: number): Promise<boolean>;

    getAllUsers(): Promise<UserType[]>;
}