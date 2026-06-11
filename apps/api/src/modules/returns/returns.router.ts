import { Router } from 'express';
import { ReturnsController } from './returns.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', authorize(['ADMIN', 'OPERATOR_INVENTORY']), ReturnsController.processReturn);
router.get('/:scoutId', ReturnsController.getByScout);

export { router as returnsRouter };
