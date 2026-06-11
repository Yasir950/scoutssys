import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/dashboard', ReportsController.getDashboard);
router.get('/:type/export', ReportsController.exportExcel);
router.get('/:type', ReportsController.getReport);

export { router as reportsRouter };
