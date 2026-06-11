import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();
router.use(authenticate);

router.get('/tag/:tagNumber', InventoryController.getByTag);
router.get('/categories', InventoryController.getCategories);
router.get('/cabins', InventoryController.getCabins);
router.get('/', InventoryController.getAll);
router.post('/', authorize(['ADMIN', 'OPERATOR_INVENTORY']), InventoryController.create);
router.get('/:id', InventoryController.getById);
router.put('/:id', authorize(['ADMIN', 'OPERATOR_INVENTORY']), InventoryController.update);
router.post('/categories', authorize(['ADMIN']), InventoryController.createCategory);
router.post('/cabins', authorize(['ADMIN']), InventoryController.createCabin);

export { router as inventoryRouter };
