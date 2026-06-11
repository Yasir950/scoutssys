import { Router } from 'express';
import { ScoutsController } from './scouts.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { uploadScoutPhoto } from '../../lib/multer';
import { prisma } from '../../lib/prisma';
import { ApiResponse } from '../../utils/ApiResponse';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'OPERATOR_REGISTRATION', 'VIEWER']), ScoutsController.getAll);
router.post('/', authorize(['ADMIN', 'OPERATOR_REGISTRATION']), uploadScoutPhoto.single('photo'), ScoutsController.create);
router.get('/:id', authorize(['ADMIN', 'OPERATOR_REGISTRATION', 'VIEWER']), ScoutsController.getById);
router.put('/:id', authorize(['ADMIN', 'OPERATOR_REGISTRATION']), uploadScoutPhoto.single('photo'), ScoutsController.update);

router.get('/:id/issued', authorize(['ADMIN', 'OPERATOR_INVENTORY', 'OPERATOR_REGISTRATION']), async (req, res, next) => {
  try {
    const items = await prisma.issuedItem.findMany({
      where: { scoutId: req.params['id']!, returnedAt: null },
      include: { inventoryItem: { select: { id: true, tagNumber: true, name: true, price: true } } },
      orderBy: { issuedAt: 'desc' },
    });
    ApiResponse.success(res, items, 'Issued items retrieved');
  } catch (err) { next(err); }
});

export { router as scoutsRouter };
