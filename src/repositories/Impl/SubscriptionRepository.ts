import { db } from '../../database/postgresDB.js'; 
import { subscriptions } from '../../database/schema.js';
import { eq } from 'drizzle-orm';
import { SubscriptionType } from '../../models/subscriptions.js';
import { ISubscriptionRepository } from '../ISubscriptionRepository.js';

export class SubscriptionRepository implements ISubscriptionRepository {
    async create(subscription: Omit<SubscriptionType, 'id'>): Promise<SubscriptionType> {
        const [newSubscription] = await db.insert(subscriptions)
            .values(subscription)
            .returning(); // Returns the newly created subscription
        return newSubscription;
    }

    async getById(id: number): Promise<SubscriptionType | null> {
        const [subscription] = await db.select().from(subscriptions)
            .where(eq(subscriptions.id, id));
        return subscription || null;
    }

    async getAllByUserId(userId: number): Promise<SubscriptionType[]> {
        const results = await db.select().from(subscriptions)
            .where(eq(subscriptions.user_id, userId));
        return results;
    }

    async update(id: number, updatedFields: Partial<SubscriptionType>): Promise<void> {
        await db.update(subscriptions)
            .set(updatedFields)
            .where(eq(subscriptions.id, id));
    }

    async delete(id: number): Promise<void> {
        await db.delete(subscriptions).where(eq(subscriptions.id, id));
    }
}
