import { SubscriptionType } from "../models/subscriptions.js";

export interface ISubscriptionService {
    createOrUpdateSubscription(userId: number, startDate: Date, endDate?: Date): Promise<SubscriptionType>;  
    
    getSubscriptionById(id: number): Promise<SubscriptionType | null>;

    getSubscriptionsByUserId(userId: number): Promise<SubscriptionType[]>;
    
    updateSubscription(id: number, updatedFields: Partial<SubscriptionType>): Promise<void>;

    deactivateSubscription(id: number): Promise<void>;

    deleteSubscription(id: number): Promise<void>;
}
