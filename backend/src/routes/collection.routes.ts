import { Router } from 'express';
import { body, param } from 'express-validator';
import { CollectionController } from '../controllers/collection.controller';
import { validate } from '../middleware/validateDto';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const controller = new CollectionController();

// Rutas Públicas (para la tienda y las stories)
router.get('/', controller.getAll);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', validate([param('id').isInt().withMessage('ID inválido')]), controller.getById);

// Rutas Administrativas (protegidas)
router.post(
  '/',
  requireAdmin,
  validate([
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('slug').optional().trim(),
    body('description').optional({ nullable: true }),
    body('image_url').optional({ nullable: true }),
    body('badge').optional({ nullable: true }),
    body('display_order').optional().isInt(),
    body('is_active').optional().isBoolean(),
    body('product_ids').optional().isArray(),
  ]),
  controller.create
);

router.put(
  '/:id',
  requireAdmin,
  validate([
    param('id').isInt().withMessage('ID inválido'),
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('slug').optional().trim(),
    body('description').optional({ nullable: true }),
    body('image_url').optional({ nullable: true }),
    body('badge').optional({ nullable: true }),
    body('display_order').optional().isInt(),
    body('is_active').optional().isBoolean(),
    body('product_ids').optional().isArray(),
  ]),
  controller.update
);

router.post(
  '/:id/products',
  requireAdmin,
  validate([
    param('id').isInt().withMessage('ID inválido'),
    body('product_ids').isArray().withMessage('product_ids debe ser un arreglo de IDs'),
  ]),
  controller.setProducts
);

router.delete(
  '/:id',
  requireAdmin,
  validate([param('id').isInt().withMessage('ID inválido')]),
  controller.delete
);

export default router;
