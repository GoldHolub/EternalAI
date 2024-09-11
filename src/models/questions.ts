import { questions } from "../database/schema.js";
import { InferSelectModel } from "drizzle-orm";

export type QuestionType = InferSelectModel<typeof questions>; 
