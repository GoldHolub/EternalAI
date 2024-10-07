import { db } from "../../database/postgresDB.js";
import { individuals } from "../../database/schema.js";
import { eq, sql } from "drizzle-orm";
export class IndividualsRepository {
    async getIndividuals({ offset, limit }) {
        return await db.select()
            .from(individuals)
            .orderBy(individuals.id)
            .offset(offset)
            .limit(limit)
            .execute();
    }
    async getIndividualById(id) {
        const [individual] = await db
            .select()
            .from(individuals)
            .where(eq(individuals.id, id))
            .execute();
        return individual;
    }
    async createIndividual(newIndividual) {
        const [createdIndividual] = await db
            .insert(individuals)
            .values(newIndividual)
            .returning();
        return createdIndividual;
    }
    async updateIndividual(id, updatedData) {
        const [updatedIndividual] = await db
            .update(individuals)
            .set(updatedData)
            .where(eq(individuals.id, id))
            .returning();
        return updatedIndividual;
    }
    async deleteIndividual(id) {
        const [deletedIndividual] = await db.delete(individuals)
            .where(eq(individuals.id, id))
            .returning();
        return deletedIndividual;
    }
    async countIndividuals() {
        const [result] = await db
            .select({ count: sql `COUNT(*)` })
            .from(individuals)
            .execute();
        return Number(result.count);
    }
}
//# sourceMappingURL=IndividualsRepository.js.map