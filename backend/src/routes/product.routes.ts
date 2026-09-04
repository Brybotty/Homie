import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validateDto';

const router = Router();
const controller = new ProductController();

router.get(
  '/',
  validate([
    query('category').optional().isString().trim(),
    query('active').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 1000 }),
  ]),
  controller.getAll
);

router.get(
  '/:slug',
  validate([param('slug').isString().trim().notEmpty().withMessage('El slug es requerido')]),
  controller.getBySlug
);

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 200 }),
    body('slug').trim().notEmpty().withMessage('El slug es requerido').isLength({ max: 220 }),
    body('category_id').optional({ nullable: true }).isInt(),
    body('description').optional({ nullable: true }).isString(),
    body('short_description').optional({ nullable: true }).isString().isLength({ max: 300 }),
    body('featured_image_url').optional({ nullable: true }).isString(),
    body('is_active').optional().isBoolean(),
    body('collection_ids').optional().isArray(),
    body('collection_ids.*').isInt(),
    body('variants').isArray({ min: 1 }).withMessage('Debe incluir al menos una variante'),
    body('variants.*.id').optional({ nullable: true }).isInt(),
    body('variants.*.sku').trim().notEmpty().withMessage('El SKU de la variante es requerido'),
    body('variants.*.supplier_sku').optional({ nullable: true }).isString(),
    body('variants.*.variant_name').trim().notEmpty().withMessage('El nombre de la variante es requerido'),
    body('variants.*.wholesale_price').isFloat({ min: 0 }).withMessage('El precio mayorista debe ser >= 0'),
    body('variants.*.retail_price').isFloat({ min: 0 }).withMessage('El precio de venta debe ser >= 0'),
    body('variants.*.stock_quantity').optional().isInt({ min: 0 }),
    body('variants.*.weight_grams').optional().isInt({ min: 1 }),
    body('variants.*.image_url').optional({ nullable: true }).isString(),
    body('variants.*.is_active').optional().isBoolean(),
  ]),
  controller.create
);

router.put(
  '/reorder',
  validate([
    body('product_ids').isArray({ min: 1 }).withMessage('product_ids debe ser un arreglo de IDs'),
    body('product_ids.*').isInt().withMessage('Cada ID debe ser un número entero'),
  ]),
  controller.reorder
);

router.put(
  '/:id',
  validate([
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    body('name').optional().trim().notEmpty().isLength({ max: 200 }),
    body('slug').optional().trim().notEmpty().isLength({ max: 220 }),
    body('category_id').optional({ nullable: true }).isInt(),
    body('description').optional({ nullable: true }).isString(),
    body('short_description').optional({ nullable: true }).isString().isLength({ max: 300 }),
    body('featured_image_url').optional({ nullable: true }).isString(),
    body('is_active').optional().isBoolean(),
    body('collection_ids').optional().isArray(),
    body('collection_ids.*').isInt(),
    body('variants').optional().isArray(),
    body('variants.*.id').optional({ nullable: true }).isInt(),
    body('variants.*.sku').optional().trim().notEmpty(),
    body('variants.*.supplier_sku').optional({ nullable: true }).isString(),
    body('variants.*.variant_name').optional().trim().notEmpty(),
    body('variants.*.wholesale_price').optional().isFloat({ min: 0 }),
    body('variants.*.retail_price').optional().isFloat({ min: 0 }),
    body('variants.*.stock_quantity').optional().isInt({ min: 0 }),
    body('variants.*.weight_grams').optional().isInt({ min: 1 }),
    body('variants.*.image_url').optional({ nullable: true }).isString(),
    body('variants.*.is_active').optional().isBoolean(),
  ]),
  controller.update
);

router.put(
  '/variants/:id',
  validate([
    param('id').isInt().withMessage('El ID de variante debe ser un número entero'),
    body('variant_name').optional().trim().notEmpty(),
    body('sku').optional().trim().notEmpty(),
    body('supplier_sku').optional({ nullable: true }).isString(),
    body('wholesale_price').optional().isFloat({ min: 0 }),
    body('retail_price').optional().isFloat({ min: 0 }),
    body('stock_quantity').optional().isInt({ min: 0 }),
    body('weight_grams').optional().isInt({ min: 1 }),
    body('image_url').optional({ nullable: true }).isString(),
    body('is_active').optional().isBoolean(),
  ]),
  controller.updateVariant
);

router.patch(
  '/variants/:id/stock',
  validate([
    param('id').isInt().withMessage('El ID de variante debe ser un número entero'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('El stock_quantity debe ser un entero >= 0'),
  ]),
  controller.updateStock
);

export default router;
