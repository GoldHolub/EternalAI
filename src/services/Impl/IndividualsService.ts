import { IndividualsType } from "../../models/individuals.js";
import { IIndividualsService } from "../IIndividualsService.js";
import { IIndividualsRepository } from "../../repositories/IIndividualsRepository.js";
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IndividualsResDTO } from "../../models/dto/individualsResDTO.js";

export class IndividualsService implements IIndividualsService {
    private individualRepository: IIndividualsRepository;

    constructor(individualRepository: IIndividualsRepository) {
        this.individualRepository = individualRepository;
    }

    async getIndividualsWithImages(page: number, pageSize: number): Promise<IndividualsResDTO[]> {
        const offset = (page - 1) * pageSize;
        const individuals = await this.individualRepository.getIndividuals({ offset, limit: pageSize });
        const individualsWithImages: IndividualsResDTO[] = await Promise.all(individuals.map(async (individual) => {
            const smallImageBuffer = await fs.readFile(individual.smallImagePath);
            //const fullImageBuffer = await fs.readFile(individual.fullImagePath);

            return {
                id: individual.id,
                name: individual.name,
                title: individual.title,
                smallImage: smallImageBuffer,
            };
        }));

        return individualsWithImages;
    }

    async getIndividualImageById(id: number): Promise<Buffer> {
        try {
            const individual = await this.individualRepository.getIndividualById(id);
            if (!individual) {
                throw new Error(`Individual not found`);
            }
            const imageBuffer = await fs.readFile(individual.fullImagePath);
            return imageBuffer;
        } catch (error: any) {
            throw new Error(`Error getting individual image: ${error.message}`);
        }
    }

    async createIndividual(name: string, title: string, prompt: string, images: Express.Multer.File[]): Promise<IndividualsType> {
        if (!images || !images[0] || !images[1]) {
            throw new Error('Two images is required');
        }
        if (!name || !title || !prompt) {
            throw new Error('Name, title, and prompt are required');
        }

        try {
            const smallFileFolder = process.env.IMAGE_FOLDER_SMALL!;
            const fullFileFolder = process.env.IMAGE_FOLDER_FULL!;
            const smallSavedImagePath = await IndividualsService.addImageToFolder(images[0], smallFileFolder);
            let fullSavedImagePath = await IndividualsService.addImageToFolder(images[1], fullFileFolder);

            const newIndividual = {
                name,
                title,
                prompt,
                smallImagePath: smallSavedImagePath,
                fullImagePath: fullSavedImagePath,
            };

            const createdIndividual = await this.individualRepository.createIndividual(newIndividual);
            return createdIndividual;
        } catch (error) {
            throw new Error(`Error creating individual`);
        }
    }

    async updateIndividual(id: number, name?: string, title?: string, prompt?: string, images?: Express.Multer.File[]): Promise<IndividualsType> {
        const individual = await this.individualRepository.getIndividualById(id);
        if (!individual) {
            throw new Error(`Individual with ID ${id} not found.`);
        }

        try {
            if (images && images[0]) {
                IndividualsService.updateImage(images[0], individual.smallImagePath);
            }
            if (images && images[1] && individual.fullImagePath) {
                IndividualsService.updateImage(images[1], individual.fullImagePath);
            } else if (images && images[1] && !individual.fullImagePath) {
                const fullFileFolder = process.env.IMAGE_FOLDER_FULL!;
                const fullSavedImagePath = await IndividualsService.addImageToFolder(images[1], fullFileFolder);
                individual.fullImagePath = fullSavedImagePath;
            }

            if (name) individual.name = name;
            if (title) individual.title = title;
            if (prompt) individual.prompt = prompt;

            const updatedIndividual = await this.individualRepository.updateIndividual(id, individual);
            return updatedIndividual;
        } catch (error: any) {
            throw new Error(`Error updating individual: ${error.message}`);
        }
    }

    async deleteIndividual(id: number): Promise<boolean> {
        try {
            const deletedIndividual = await this.individualRepository.deleteIndividual(id);
            if (!deletedIndividual) {
                throw new Error(`Individual with ID ${id} not found.`);
            } else {
                await fs.unlink(deletedIndividual.fullImagePath);
                await fs.unlink(deletedIndividual.smallImagePath);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    static async addImageToFolder(file: Express.Multer.File, folderPath: string) {
        try {
            const ext = path.extname(file.originalname);
            const uniqueFileName = `${uuidv4()}${ext}`;

            await fs.mkdir(folderPath, { recursive: true });
            const filePath = path.join(folderPath!, uniqueFileName);
            await fs.copyFile(file.path, filePath);
            await fs.unlink(file.path);

            return filePath;
        }
        catch (error: any) {
            throw new Error(`Can't add file ${file.filename} to DB. ${error.message} -- ${error.stack}`);
        }
    }

    static async updateImage(file: Express.Multer.File, filePath: string) {
        try {
            await fs.copyFile(file.path, filePath);
            await fs.unlink(file.path);
            return filePath;
        }
        catch (error: any) {
            throw new Error(`Can't add file ${file.filename} to DB. ${error.message} -- ${error.stack}`);
        }
    }

}