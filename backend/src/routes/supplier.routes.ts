import { Router } from 'express';
import { body } from 'express-validator';
import { SupplierController } from '../controllers/supplier.controller';
import { validate } from '../middleware/validateDto';

const router = Router();
const controller = new SupplierController();

router.get('/current', controller.getCurrent);

router.post(
  '/consolidate',
  validate([
    body('supplier_name').optional().isString().trim(),
    body('notes').optional().isString(),
    body('items').optional().isArray(),
    body('items.*.variant_id').optional().isInt(),
    body('items.*.quantity').optional().isInt({ min: 1 }),
  ]),
  controller.consolidate
);

export default router;
