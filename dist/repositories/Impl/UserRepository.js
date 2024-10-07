import { db } from '../../database/postgresDB.js';
import { users } from '../../database/schema.js';
import { eq } from 'drizzle-orm';
export class UserRepository {
    async createUser(email, password, name) {
        const [newUser] = await db.insert(users)
            .values({
            email: email,
            password: password,
            name: name,
        }).returning();
        return newUser;
    }
    async getUserById(id) {
        const [user] = await db.select()
            .from(users)
            .where(eq(users.id, id)).limit(1);
        return user || null;
    }
    async getUserByEmail(email) {
        const [user] = await db.select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return user || null;
    }
    async updateUser(id, updates) {
        const [updatedUser] = await db.update(users)
            .set(updates)
            .where(eq(users.id, id))
            .returning();
        return updatedUser || null;
    }
    async deleteUser(id) {
        const [deletedUser] = await db.delete(users)
            .where(eq(users.id, id))
            .returning();
        return !!deletedUser;
    }
    async getAllUsers() {
        const allUsers = await db.select()
            .from(users);
        return allUsers;
    }
}
//# sourceMappingURL=UserRepository.js.map