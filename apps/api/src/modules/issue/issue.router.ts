import { Router } from 'express';
import { IssueController } from './issue.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', authorize(['ADMIN', 'OPERATOR_INVENTORY']), IssueController.issue);
router.get('/:scoutId', authorize(['ADMIN', 'OPERATOR_INVENTORY', 'VIEWER']), IssueController.getByScout);

export { router as issueRouter };
