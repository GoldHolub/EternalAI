import { subscriptions } from "../database/schema"
import { InferSelectModel } from "drizzle-orm";

export type SubscriptionType = InferSelectModel<typeof subscriptions>;