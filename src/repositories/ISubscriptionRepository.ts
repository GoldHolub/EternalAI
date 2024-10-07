import { SubscriptionType } from "../models/subscriptions";

export interface ISubscriptionRepository {
    create(subscription: Omit<SubscriptionType, 'id'>): Promise<SubscriptionType>;

    getById(id: number): Promise<SubscriptionType | null>;

    getAllByUserId(userId: number): Promise<SubscriptionType[]>;

    update(id: number, updatedFields: Partial<SubscriptionType>): Promise<void>;
    
    delete(id: number): Promise<void>;
}