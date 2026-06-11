import { Router } from 'express';
import { ExchangeController } from './exchange.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/', ExchangeController.getAll);
router.post('/', authorize(['ADMIN', 'OPERATOR_INVENTORY']), ExchangeController.exchange);

export { router as exchangeRouter };
