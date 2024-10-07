import { db } from '../../database/postgresDB.js';
import { subscriptions } from '../../database/schema.js';
import { eq } from 'drizzle-orm';
export class SubscriptionRepository {
    async create(subscription) {
        const [newSubscription] = await db.insert(subscriptions)
            .values(subscription)
            .returning(); // Returns the newly created subscription
        return newSubscription;
    }
    async getById(id) {
        const [subscription] = await db.select().from(subscriptions)
            .where(eq(subscriptions.id, id));
        return subscription || null;
    }
    async getAllByUserId(userId) {
        const results = await db.select().from(subscriptions)
            .where(eq(subscriptions.user_id, userId));
        return results;
    }
    async update(id, updatedFields) {
        await db.update(subscriptions)
            .set(updatedFields)
            .where(eq(subscriptions.id, id));
    }
    async delete(id) {
        await db.delete(subscriptions).where(eq(subscriptions.id, id));
    }
}
//# sourceMappingURL=SubscriptionRepository.js.map