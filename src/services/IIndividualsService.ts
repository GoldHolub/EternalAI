import { IndividualsResDTO } from "../models/dto/individualsResDTO.js";
import { IndividualsType } from "../models/individuals.js";

export interface IIndividualsService {
    getIndividualsWithImages(page: number, pageSize: number): Promise<IndividualsResDTO[]>;

    getIndividualImageById(id: number): Promise<Buffer>;

    createIndividual(name: string, title: string, prompt: string, images: Express.Multer.File[]): Promise<IndividualsType>;

    updateIndividual(id: number, name?: string, title?: string, prompt?: string, images?: Express.Multer.File[]):Promise<IndividualsType>;

    deleteIndividual(id: number): Promise<boolean>;
}