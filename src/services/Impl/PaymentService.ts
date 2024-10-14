import { UserType } from "../../models/users.js";
import { IPaymentService } from "../IPaymentService.js";
import { Stripe } from 'stripe';
import { UserRepository } from "../../repositories/Impl/UserRepository.js";
import { EmailService } from "./EmailService.js";
import { SubscriptionService } from "./SubscriptionService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const userRepository = new UserRepository();
const emailService = new EmailService();
const subscriptionService = new SubscriptionService();

export class PaymentService implements IPaymentService {
    async createSubscription(user: UserType, paymentMethodId: string): Promise<any> {
        try {
            const customerId = await this.getOrCreateCustomer(user.email, user.name, paymentMethodId);

            const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
            if (subscriptions.data.length > 0) {
                return { success: true };
            }

            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: process.env.STRIPE_PRICE_ID! }],
                default_payment_method: paymentMethodId,
                expand: ['latest_invoice.payment_intent'],
            });
            const invoice = subscription.latest_invoice as Stripe.Invoice;
            const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

            return {
                success: true,
                subscriptionId: subscription.id,
                clientSecret: paymentIntent.client_secret,
            };
        } catch (error) {
            throw new Error('Failed to create subscription. Please try again later.');
        }
    }

    async updateSubscription(user: UserType, paymentMethodId: string): Promise<any> {
        try {
            const customer = await this.getCustomerByEmail(user.email);
            const subscriptions = await this.getSubscriptionByCustomer(customer.id);
            const subscriptionId = subscriptions?.id;
            if (!subscriptionId) throw new Error('Subscription not found for customer');

            await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });

            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                }
            });

            await stripe.subscriptions.update(subscriptionId, {
                default_payment_method: paymentMethodId,
            });

            return { success: true }
        } catch (error) {
            throw new Error('Failed to update subscription. Please try again later.');
        }
    }

    async cancelSubscription(user: UserType): Promise<any> {
        try {
            const customer = await this.getCustomerByEmail(user.email);
            const subscription = await this.getSubscriptionByCustomer(customer.id);

            if (!subscription) throw new Error('Subscription not found for customer');

            const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
                cancel_at_period_end: true,
            });

            userRepository.updateUser(user.id, { isSubscriptionCanceled: true });
            return { success: true }
        } catch (error: any) {
            throw new Error(`Failed to cancel subscription. Please try again later. ${error.message}`);
        }
    }

    async renewSubscription(user: UserType): Promise<any> {
        try {
            const customer =  await this.getCustomerByEmail(user.email);
            const subscription = await this.getSubscriptionByCustomer(customer.id);

            if (!subscription) throw new Error('Subscription not found for customer');

            if (subscription.cancel_at_period_end) {
                const resumedSubscription = await stripe.subscriptions.update(subscription.id, {
                    cancel_at_period_end: false,
                });

                userRepository.updateUser(user.id, {isSubscriptionCanceled: false});

                return { success: true };
            } else {
                return { success: true, message: 'Subscription is already active.' };
            }
        } catch (error) {
            throw new Error('Failed to renew subscription. Please try again later.');
        }
    }

    async handlePaymentResponse(payload: Buffer, sig: string | string[]): Promise<any> {
        try {
            const event = await stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
            console.log('Received event:', event.type);

            if (event.type === 'customer.subscription.created') {
                const subscription = event.data.object as Stripe.Subscription;
                const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
                const user = await userRepository.getUserByEmail(customer.email as string);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: true });
                }

            }
            if (event.type === 'invoice.payment_succeeded') {
                const invoice = event.data.object as Stripe.Invoice;
                const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
                const endDate = event.data.object.lines.data[0].period.end;
                const dateEnd = new Date(endDate * 1000);

                const user = await userRepository.getUserByEmail(customer.email as string);

                if (!user) return { received: true };

                await userRepository.updateUser(user.id, { has_subscription: true, isSubscriptionCanceled: false });
                const subscription = await subscriptionService.createOrUpdateSubscription(user.id, new Date(), dateEnd);
                emailService.sendPaymentSuccessEmail(customer.email as string);
            }

            if (event.type === 'invoice.payment_failed') {
                const invoice = event.data.object as Stripe.Invoice;
                const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
                const user = await userRepository.getUserByEmail(customer.email as string);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: false });
                }
            }
            if (event.type === 'customer.subscription.deleted') {
                const subscription = event.data.object as Stripe.Subscription;
                const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
                const user = await userRepository.getUserByEmail(customer.email as string);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: false });
                }
            }

            if (event.type === 'customer.subscription.pending_update_expired') {
                const subscription = event.data.object as Stripe.Subscription;
                const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
                const user = await userRepository.getUserByEmail(customer.email as string);
                if (user) {
                    await userRepository.updateUser(user.id, { has_subscription: false });
                }
            }
            return { received: true };
        } catch (error) {
            throw new Error('Failed to handle payment response. Please try again later.');
        }
    }

    async getOrCreateCustomer(customerEmail: string, customerName: string | null, paymentMethodId: string): Promise<string> {
        let customer;
        const customers = await stripe.customers.list({
            email: customerEmail, 
            limit: 1
        });

        if (customers.data.length > 0) {
            customer = customers.data[0];
            console.log('Customer exists:', customer.id);
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });

            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                }
            });
        } else {
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

    async updateUserStripeAccountEmail(oldEmail: string, newEmail: string): Promise<void> {
        const customer = await this.getCustomerByEmail(oldEmail);
        await stripe.customers.update(customer.id, {
            email: newEmail
        });
    }

    private async getCustomerByEmail(email: string): Promise<Stripe.Customer> {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length === 0) throw new Error('Customer not found');
        return customers.data[0];
    }

    private async getSubscriptionByCustomer(customerId: string): Promise<Stripe.Subscription | null> {
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        return subscriptions.data.length > 0 ? subscriptions.data[0] : null;
    }
}

