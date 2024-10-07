import { db } from "../../database/postgresDB.js";
import { IndividualsType } from "../../models/individuals.js";
import { PaginationOptions } from "../../models/paginationOptions.js";
import { IIndividualsRepository } from "../IIndividualsRepository.js";
import { individuals } from "../../database/schema.js";
import { eq, sql } from "drizzle-orm";

export class IndividualsRepository implements IIndividualsRepository {
    async getIndividuals({ offset, limit }: PaginationOptions): Promise<IndividualsType[]> {
        return await db.select()
            .from(individuals)
            .orderBy(individuals.id)
            .offset(offset)
            .limit(limit)
            .execute();
    }

    async getIndividualById(id: number): Promise<IndividualsType | null> {
        const [individual] = await db
            .select()
            .from(individuals)
            .where(eq(individuals.id, id))
            .execute();

        return individual;
    }

    async createIndividual(newIndividual: Omit<IndividualsType, "id" | "created_at">): Promise<IndividualsType> {
        const [createdIndividual] = await db
            .insert(individuals)
            .values(newIndividual)
            .returning();

        return createdIndividual;
    }

    async updateIndividual(id: number, updatedData: Partial<IndividualsType>): Promise<IndividualsType> {
        const [updatedIndividual] = await db
            .update(individuals)
            .set(updatedData)
            .where(eq(individuals.id, id))
            .returning();
        return updatedIndividual;
    }
    async deleteIndividual(id: number): Promise<IndividualsType> {

        const [deletedIndividual] = await db.delete(individuals)
            .where(eq(individuals.id, id))
            .returning();
        
        return deletedIndividual;    
    }

    async countIndividuals(): Promise<number> {
        const [result] = await db
        .select({ count: sql`COUNT(*)` })
            .from(individuals)
            .execute();
    
        return Number(result.count);  
    }
}