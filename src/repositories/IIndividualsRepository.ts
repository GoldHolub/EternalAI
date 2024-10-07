import { PaginationOptions } from "../models/paginationOptions.js";
import { IndividualsType } from "../models/individuals.js";

export interface IIndividualsRepository {
    getIndividuals(options: PaginationOptions): Promise<IndividualsType[]>;

    getIndividualById(id: number): Promise<IndividualsType | null>;

    createIndividual(newIndividual: Omit<IndividualsType, 'id' | 'created_at'>): Promise<IndividualsType>;

    updateIndividual(id: number, updatedData: Partial<IndividualsType>): Promise<IndividualsType>;

    deleteIndividual(id: number): Promise<IndividualsType>;

    countIndividuals(): Promise<number>;
}