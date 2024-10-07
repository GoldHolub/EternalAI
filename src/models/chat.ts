import { chats } from "../database/schema.js";
import { InferSelectModel } from "drizzle-orm";

export type ChatType = InferSelectModel<typeof chats>;