import { Request, Response, NextFunction } from 'express';
import { IIndividualsService } from '../services/IIndividualsService';

export class IndividualsController {
    private individualsService: IIndividualsService;

    constructor(individualsService: IIndividualsService) {
        this.individualsService = individualsService;
    }

    async getIndividuals(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page: number = parseInt(req.query.page as string) || 1;
            const pageSize: number = parseInt(req.query.pageSize as string) || 10;
            const individuals = await this.individualsService.getIndividualsWithImages(page, pageSize);
            res.status(200).json(individuals);
        } catch (error) {
            next(error);
        }
    }

    async getIndividualImageById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: number = parseInt(req.params.id);
            const individualImage =  await this.individualsService.getIndividualImageById(id);

            res.status(200).json({ imageBuffer: individualImage });
        } catch (error: any) {
            next(error);
        }
    }

    async createIndividual(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const name: string = req.body.name;
            const title: string = req.body.title;
            const prompt: string = req.body.prompt;
            const files = req.files as Express.Multer.File[];

            const newIndividual = await this.individualsService.createIndividual(name, title, prompt, files);
            res.status(201).json({ id: newIndividual.id, name: newIndividual.name, title: newIndividual.title });
        } catch (error) {
            next(error);
        }
    }

    async updateIndividual(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: number = parseInt(req.params.id);
            const name: string = req.body.name;
            const title: string = req.body.title;
            const prompt: string = req.body.prompt;
            const files = req.files as Express.Multer.File[];

            const updatedIndividual = await this.individualsService.updateIndividual(id, name, title, prompt, files);
            res.status(200).json({ id: updatedIndividual.id, name: updatedIndividual.name, title: updatedIndividual.title, prompt: updatedIndividual.prompt });
        } catch (error) {
            next(error);
        }
    }

    async deleteIndividual(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: number = parseInt(req.params.id);
            const isDeleted = await this.individualsService.deleteIndividual(id);
            res.status(200).json({ deleted: isDeleted });
        } catch (error) {
            next(error);
        }
    }
}