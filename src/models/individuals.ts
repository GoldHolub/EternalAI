import { individuals } from "../database/schema.js";
import { InferSelectModel } from "drizzle-orm";

export type IndividualsType = InferSelectModel<typeof individuals>;
 