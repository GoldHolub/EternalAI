import { db } from '../../database/postgresDB.js';
import { users } from '../../database/schema.js';
import { eq } from 'drizzle-orm';
import { IUserRepository } from '../IUserRepository.js';
import { UserType } from '../../models/users.js';

export class UserRepository implements IUserRepository {
    async createUser(user: Omit<UserType, 'id' | 'name' | 'phone' |'role' | 'has_subscription' |'created_at'>): Promise<UserType> {
        const [newUser] = await db.insert(users)
            .values({
                email: user.email,
                password: user.password,
            }).returning();

        return newUser;
    }

    async getUserById(id: number): Promise<UserType | null> {
        const [user] = await db.select()
            .from(users)
            .where(eq(users.id, id)).limit(1);

        return user || null;
    }

    async getUserByEmail(email: string): Promise<UserType | null> {
        const [user] = await db.select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user || null;
    }

    async updateUser(id: number, updates: Partial<Omit<UserType, 'id' | 'created_at'>>): Promise<UserType | null> {
        const [updatedUser] = await db.update(users)
            .set(updates)
            .where(eq(users.id, id))
            .returning();

        return updatedUser || null;
    }

    async deleteUser(id: number): Promise<boolean> {
        const [deletedUser] = await db.delete(users)
            .where(eq(users.id, id))
            .returning();

        return !!deletedUser;
    }

    async getAllUsers(): Promise<UserType[]> {
        const allUsers: UserType[] = await db.select()
            .from(users);

        return allUsers;
    }
}
