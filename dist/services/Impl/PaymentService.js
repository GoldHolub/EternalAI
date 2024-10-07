import { Stripe } from 'stripe';
import { UserRepository } from "../../repositories/Impl/UserRepository.js";
import { EmailService } from "./EmailService.js";
import { SubscriptionService } from "./SubscriptionService.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});
const userRepository = new UserRepository();
const emailService = new EmailService();
const subscriptionService = new SubscriptionService();
export class PaymentService {
    async createSubscription(user, paymentMethodId) {
        try {
            const customerId = await this.getOrCreateCustomer(user.email, user.name, paymentMethodId);
            const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
            if (subscriptions.data.length > 0) {
                return { success: true };
            }
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: process.env.STRIPE_PRICE_ID }],
                default_payment_method: paymentMethodId,
                expand: ['latest_invoice.payment_intent'],
            });
            const invoice = subscription.latest_invoice;
            const paymentIntent = invoice.payment_intent;
            return {
                success: true,
                subscriptionId: subscription.id,
                clientSecret: paymentIntent.client_secret,
            };
        }
        catch (error) {
            throw new Error('Failed to create subscription. Please try again later.');
        }
    }
    async updateSubscription(user, paymentMethodId) {
        try {
            const customers = await stripe.customers.list({
                email: user.email, // Search for existing customer by email
                limit: 1
            });
            if (customers.data.length < 0)
                throw new Error('Customer not found');
            const customer = customers.data[0];
            const subscriptions = await stripe.subscriptions.list({ customer: customer.id, limit: 1 });
            const subscriptionId = subscriptions.data[0].id;
            if (!subscriptionId)
                throw new Error('Subscription not found for customer');
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                }
            });
            await stripe.subscriptions.update(subscriptionId, {
                default_payment_method: paymentMethodId,
            });
            return { success: true };
        }
        catch (error) {
            throw new Error('Failed to update subscription. Please try again later.');
        }
    }
    async cancelSubscription(user) {
        try {
            const customers = await stripe.customers.list({
                email: user.email, // Search for existing customer by email
                limit: 1
            });
            if (customers.data.length === 0)
                throw new Error('Customer not found');
            const customer = customers.data[0]; // Get customer
            const subscriptions = await stripe.subscriptions.list({ customer: customer.id, limit: 1 });
            const subscription = subscriptions.data[0];
            if (!subscription)
                throw new Error('Subscription not found for customer');
            const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
                cancel_at_period_end: true,
            });
            userRepository.updateUser(user.id, { isSubscriptionCanceled: true });
            return { success: true };
        }
        catch (error) {
            throw new Error('Failed to cancel subscription. Please try again later.');
        }
    }
    async renewSubscription(user) {
        try {
            const customers = await stripe.customers.list({
                email: user.email,
                limit: 1
            });
            if (customers.data.length === 0)
                throw new Error('Customer not found');
            const customer = customers.data[0];
            const subscriptions = await stripe.subscriptions.list({ customer: customer.id, limit: 1 });
            const subscription = subscriptions.data[0];
            if (!subscription)
                throw new Error('Subscription not found for customer');
            if (subscription.cancel_at_period_end) {
                const resumedSubscription = await stripe.subscriptions.update(subscription.id, {
                    cancel_at_period_end: false,
                });
                return { success: true };
            }
            else {
                return { success: true, message: 'Subscription is already active.' };
            }
        }
        catch (error) {
            throw new Error('Failed to renew subscription. Please try again later.');
        }
    }
    async handlePaymentResponse(payload, sig) {
        try {
            const event = await stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
            console.log('Received event:', event.type);
            if (event.type === 'customer.subscription.created') {
                const subscription = event.data.object;
                const customer = await stripe.customers.retrieve(subscription.customer);
                const user = await userRepository.getUserByEmail(customer.email);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: true });
                }
            }
            if (event.type === 'invoice.payment_succeeded') {
                const invoice = event.data.object;
                const customer = await stripe.customers.retrieve(invoice.customer);
                const endDate = event.data.object.lines.data[0].period.end;
                const dateEnd = new Date(endDate * 1000);
                const user = await userRepository.getUserByEmail(customer.email);
                if (!user)
                    return { received: true };
                await userRepository.updateUser(user.id, { has_subscription: true });
                const subscription = await subscriptionService.createOrUpdateSubscription(user.id, new Date(), dateEnd);
                emailService.sendPaymentSuccessEmail(customer.email);
            }
            if (event.type === 'invoice.payment_failed') {
                const invoice = event.data.object;
                const customer = await stripe.customers.retrieve(invoice.customer);
                const user = await userRepository.getUserByEmail(customer.email);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: false });
                }
            }
            if (event.type === 'customer.subscription.deleted') {
                const subscription = event.data.object;
                const customer = await stripe.customers.retrieve(subscription.customer);
                const user = await userRepository.getUserByEmail(customer.email);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: false });
                }
            }
            if (event.type === 'customer.subscription.pending_update_expired') {
                const subscription = event.data.object;
                const customer = await stripe.customers.retrieve(subscription.customer);
                const user = await userRepository.getUserByEmail(customer.email);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: false });
                }
            }
            return { received: true };
        }
        catch (error) {
            throw new Error('Failed to handle payment response. Please try again later.');
        }
    }
    async getOrCreateCustomer(customerEmail, customerName, paymentMethodId) {
        let customer;
        const customers = await stripe.customers.list({
            email: customerEmail, // Search for existing customer by email
            limit: 1
        });
        if (customers.data.length > 0) {
            customer = customers.data[0];
            console.log('Customer exists:', customer.id);
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
            // Update default payment method
            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                }
            });
        }
        else {
            customer = await stripe.customers.create({
                email: customerEmail,
                name: customerName || 'John Doe',
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                }
            });
            console.log('Customer created:', customer.id);
        }
        return customer.id;
    }
    async updateUserStripeAccountEmail(oldEmail, newEmail) {
        const customers = await stripe.customers.list({
            email: oldEmail, // Search for existing customer by email
            limit: 1
        });
        if (customers.data.length < 0)
            throw new Error('Customer not found');
        const customer = customers.data[0];
        await stripe.customers.update(customer.id, {
            email: newEmail
        });
    }
}
//# sourceMappingURL=PaymentService.js.map