import { UserType } from "../models/users";


export interface IPaymentService {
    createSubscription(user: UserType, paymentMethodId: string): Promise<any>;

    updateSubscription(user: UserType, paymentMethodId: string): Promise<any>;

    cancelSubscription(user: UserType): Promise<any>;

    handlePaymentResponse(payload: Buffer, sig: string | string[]): Promise<any>;

    renewSubscription(user: UserType): Promise<any>;
}