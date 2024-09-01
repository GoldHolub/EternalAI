import { users } from "../database/schema";
import { InferSelectModel } from "drizzle-orm";

export type UserType = InferSelectModel<typeof users>;