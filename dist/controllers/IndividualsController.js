export class IndividualsController {
    individualsService;
    constructor(individualsService) {
        this.individualsService = individualsService;
    }
    async getIndividuals(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const individuals = await this.individualsService.getIndividualsWithImages(page, pageSize);
            res.status(200).json(individuals);
        }
        catch (error) {
            next(error);
        }
    }
    async getIndividualImageById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const individualImage = await this.individualsService.getIndividualImageById(id);
            res.status(200).json({ imageBuffer: individualImage });
        }
        catch (error) {
            next(error);
        }
    }
    async createIndividual(req, res, next) {
        try {
            const name = req.body.name;
            const title = req.body.title;
            const prompt = req.body.prompt;
            const files = req.files;
            const newIndividual = await this.individualsService.createIndividual(name, title, prompt, files);
            res.status(201).json({ id: newIndividual.id, name: newIndividual.name, title: newIndividual.title });
        }
        catch (error) {
            next(error);
        }
    }
    async updateIndividual(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const name = req.body.name;
            const title = req.body.title;
            const prompt = req.body.prompt;
            const files = req.files;
            const updatedIndividual = await this.individualsService.updateIndividual(id, name, title, prompt, files);
            res.status(200).json({ id: updatedIndividual.id, name: updatedIndividual.name, title: updatedIndividual.title, prompt: updatedIndividual.prompt });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteIndividual(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const isDeleted = await this.individualsService.deleteIndividual(id);
            res.status(200).json({ deleted: isDeleted });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=IndividualsController.js.map