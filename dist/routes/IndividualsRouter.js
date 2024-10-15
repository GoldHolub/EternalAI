import { Router } from 'express';
import multer from 'multer';
import { IndividualsController } from '../controllers/IndividualsController.js';
import { IndividualsService } from '../services/Impl/IndividualsService.js';
import { IndividualsRepository } from '../repositories/Impl/IndividualsRepository.js';
import { authenticateJWT } from './AiChatRouter.js';
export function createIndividualsRouter() {
    const router = Router();
    const upload = multer({ dest: 'uploads/' });
    const individualsController = new IndividualsController(new IndividualsService(new IndividualsRepository()));
    router.get('/', individualsController.getIndividuals.bind(individualsController));
    router.get('/image/:id', individualsController.getIndividualImageById.bind(individualsController));
    router.post('/', authenticateJWT(), upload.array('images'), individualsController.createIndividual.bind(individualsController));
    router.put('/:id', authenticateJWT(), upload.array('images'), individualsController.updateIndividual.bind(individualsController));
    router.delete('/:id', authenticateJWT(), individualsController.deleteIndividual.bind(individualsController));
    return Router().use('/individuals', router);
}
//# sourceMappingURL=IndividualsRouter.js.map