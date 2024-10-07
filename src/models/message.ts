import { messages } from "../database/schema.js";
import { InferSelectModel } from "drizzle-orm";

export type MessageType = InferSelectModel<typeof messages>