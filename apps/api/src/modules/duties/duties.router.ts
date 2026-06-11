import { Router } from 'express';
import { DutiesController } from './duties.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/departments', DutiesController.getDepartments);
router.post('/departments', authorize(['ADMIN']), DutiesController.createDepartment);
router.get('/', DutiesController.getAssignments);
router.post('/assign', authorize(['ADMIN', 'OPERATOR_REGISTRATION']), DutiesController.assign);
router.get('/:id', DutiesController.getById);

export { router as dutiesRouter };
