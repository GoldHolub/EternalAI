import { Router } from 'express';
import multer from 'multer';
import passport from '../middleware/passport.js';
import { IndividualsController } from '../controllers/IndividualsController.js';
import { IndividualsService } from '../services/Impl/IndividualsService.js';
import { IndividualsRepository } from '../repositories/Impl/IndividualsRepository.js';

export function createIndividualsRouter(): Router {
    const router = Router();
    const upload = multer({ dest: 'uploads/' });
    const individualsController = new IndividualsController(new IndividualsService(new IndividualsRepository()));

    router.get('/individuals',
        individualsController.getIndividuals.bind(individualsController));

    router.get('/individuals/image/:id',
        individualsController.getIndividualImageById.bind(individualsController));


    router.post('/individuals', 
        passport.authenticate('jwt', { session: false }),
        upload.array('images'),
        individualsController.createIndividual.bind(individualsController));

    router.put('/individuals/:id',
        passport.authenticate('jwt', { session: false }),
        upload.array('images'),
        individualsController.updateIndividual.bind(individualsController));
        
    router.delete('/individuals/:id',
        passport.authenticate('jwt', { session: false }),
        individualsController.deleteIndividual.bind(individualsController));
        
    return router;
}