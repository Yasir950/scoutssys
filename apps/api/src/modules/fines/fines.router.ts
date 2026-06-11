import { Router } from 'express';
import { FinesController } from './fines.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', FinesController.getAll);
router.get('/:id', FinesController.getById);
router.post('/:id/pay', authorize(['ADMIN', 'OPERATOR_INVENTORY']), FinesController.pay);
router.post('/:id/waive', authorize(['ADMIN']), FinesController.waive);

export { router as finesRouter };
