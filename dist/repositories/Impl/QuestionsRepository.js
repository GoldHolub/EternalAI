import { db } from "../../database/postgresDB.js";
import { questions } from "../../database/schema.js";
import { eq } from "drizzle-orm";
export class QuestionsRepository {
    async getQuestions() {
        try {
            const questionsResult = await db.select()
                .from(questions)
                .limit(3);
            return questionsResult;
        }
        catch (error) {
            throw new Error('Failed to get Questions from DB');
        }
    }
    async getQuestionById(id) {
        try {
            const [question] = await db.select()
                .from(questions)
                .where(eq(questions.id, id))
                .limit(1);
            return question;
        }
        catch (error) {
            throw new Error('Failed to get Question from DB');
        }
    }
    async createQuestion(question) {
        try {
            const [newQuestion] = await db.insert(questions)
                .values({ question_text: question, })
                .returning({
                id: questions.id,
                question_text: questions.question_text,
                created_at: questions.created_at
            });
            return newQuestion;
        }
        catch (error) {
            throw new Error('Failed to create Question in DB');
        }
    }
    async updateQuestion(id, updates) {
        try {
            const [updatedQuestion] = await db.update(questions)
                .set(updates)
                .where(eq(questions.id, id))
                .returning({
                id: questions.id,
                question_text: questions.question_text,
                created_at: questions.created_at,
            });
            return updatedQuestion;
        }
        catch (error) {
            throw new Error('Failed to update Question in DB');
        }
    }
    async deleteQuestion(id) {
        try {
            const result = await db.delete(questions)
                .where(eq(questions.id, id))
                .returning();
            return result.length > 0; // Return true if any rows were deleted          
        }
        catch (error) {
            throw new Error('Failed to delete Question from DB');
        }
    }
}
//# sourceMappingURL=QuestionsRepository.js.map