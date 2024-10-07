import { SubscriptionRepository } from '../../repositories/Impl/SubscriptionRepository.js';
export class SubscriptionService {
    repository;
    constructor() {
        this.repository = new SubscriptionRepository();
    }
    async createOrUpdateSubscription(userId, startDate, endDate) {
        try {
            const currentSubscriptions = await this.repository.getAllByUserId(userId);
            if (currentSubscriptions.length > 0) {
                await this.repository.update(currentSubscriptions[0].id, { end_date: endDate || null });
                return currentSubscriptions[0];
            }
            const subscription = {
                user_id: userId,
                start_date: startDate,
                end_date: endDate || null,
                is_active: true,
            };
            return await this.repository.create(subscription);
        }
        catch (error) {
            throw new Error('Failed to create subscription. Please try again later.');
        }
    }
    async getSubscriptionById(id) {
        try {
            return await this.repository.getById(id);
        }
        catch (error) {
            throw new Error('Failed to get subscription. Please try again later.');
        }
    }
    async getSubscriptionsByUserId(userId) {
        try {
            return await this.repository.getAllByUserId(userId);
        }
        catch (error) {
            throw new Error('Failed to get subscriptions. Please try again later.');
        }
    }
    async updateSubscription(id, updatedFields) {
        try {
            const subscription = await this.repository.getById(id);
            if (!subscription)
                throw new Error('Subscription not found');
            await this.repository.update(id, updatedFields);
        }
        catch (error) {
            throw new Error('Failed to update subscription. Please try again later.');
        }
    }
    async deactivateSubscription(id) {
        try {
            await this.repository.update(id, { is_active: false });
        }
        catch (error) {
            throw new Error('Failed to deactivate subscription. Please try again later.');
        }
    }
    async deleteSubscription(id) {
        try {
            await this.repository.delete(id);
        }
        catch (error) {
            throw new Error('Failed to delete subscription. Please try again later.');
        }
    }
}
//# sourceMappingURL=SubscriptionService.js.map