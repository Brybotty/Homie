"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const product_controller_1 = require("../controllers/product.controller");
const validateDto_1 = require("../middleware/validateDto");
const router = (0, express_1.Router)();
const controller = new product_controller_1.ProductController();
router.get('/', (0, validateDto_1.validate)([
    (0, express_validator_1.query)('category').optional().isString().trim(),
    (0, express_validator_1.query)('active').optional().isBoolean(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
]), controller.getAll);
router.get('/:slug', (0, validateDto_1.validate)([(0, express_validator_1.param)('slug').isString().trim().notEmpty().withMessage('El slug es requerido')]), controller.getBySlug);
router.post('/', (0, validateDto_1.validate)([
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 200 }),
    (0, express_validator_1.body)('slug').trim().notEmpty().withMessage('El slug es requerido').isLength({ max: 220 }),
    (0, express_validator_1.body)('category_id').optional({ nullable: true }).isInt(),
    (0, express_validator_1.body)('description').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('short_description').optional({ nullable: true }).isString().isLength({ max: 300 }),
    (0, express_validator_1.body)('featured_image_url').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
    (0, express_validator_1.body)('variants').isArray({ min: 1 }).withMessage('Debe incluir al menos una variante'),
    (0, express_validator_1.body)('variants.*.id').optional({ nullable: true }).isInt(),
    (0, express_validator_1.body)('variants.*.sku').trim().notEmpty().withMessage('El SKU de la variante es requerido'),
    (0, express_validator_1.body)('variants.*.supplier_sku').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('variants.*.variant_name').trim().notEmpty().withMessage('El nombre de la variante es requerido'),
    (0, express_validator_1.body)('variants.*.wholesale_price').isFloat({ min: 0 }).withMessage('El precio mayorista debe ser >= 0'),
    (0, express_validator_1.body)('variants.*.retail_price').isFloat({ min: 0 }).withMessage('El precio de venta debe ser >= 0'),
    (0, express_validator_1.body)('variants.*.stock_quantity').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('variants.*.weight_grams').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('variants.*.image_url').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('variants.*.is_active').optional().isBoolean(),
]), controller.create);
router.put('/reorder', (0, validateDto_1.validate)([
    (0, express_validator_1.body)('product_ids').isArray({ min: 1 }).withMessage('product_ids debe ser un arreglo de IDs'),
    (0, express_validator_1.body)('product_ids.*').isInt().withMessage('Cada ID debe ser un número entero'),
]), controller.reorder);
router.put('/:id', (0, validateDto_1.validate)([
    (0, express_validator_1.param)('id').isInt().withMessage('El ID debe ser un número entero'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty().isLength({ max: 200 }),
    (0, express_validator_1.body)('slug').optional().trim().notEmpty().isLength({ max: 220 }),
    (0, express_validator_1.body)('category_id').optional({ nullable: true }).isInt(),
    (0, express_validator_1.body)('description').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('short_description').optional({ nullable: true }).isString().isLength({ max: 300 }),
    (0, express_validator_1.body)('featured_image_url').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
    (0, express_validator_1.body)('variants').optional().isArray(),
    (0, express_validator_1.body)('variants.*.id').optional({ nullable: true }).isInt(),
    (0, express_validator_1.body)('variants.*.sku').optional().trim().notEmpty(),
    (0, express_validator_1.body)('variants.*.supplier_sku').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('variants.*.variant_name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('variants.*.wholesale_price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('variants.*.retail_price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('variants.*.stock_quantity').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('variants.*.weight_grams').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('variants.*.image_url').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('variants.*.is_active').optional().isBoolean(),
]), controller.update);
router.put('/variants/:id', (0, validateDto_1.validate)([
    (0, express_validator_1.param)('id').isInt().withMessage('El ID de variante debe ser un número entero'),
    (0, express_validator_1.body)('variant_name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('sku').optional().trim().notEmpty(),
    (0, express_validator_1.body)('supplier_sku').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('wholesale_price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('retail_price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('stock_quantity').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('weight_grams').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('image_url').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
]), controller.updateVariant);
router.patch('/variants/:id/stock', (0, validateDto_1.validate)([
    (0, express_validator_1.param)('id').isInt().withMessage('El ID de variante debe ser un número entero'),
    (0, express_validator_1.body)('stock_quantity').isInt({ min: 0 }).withMessage('El stock_quantity debe ser un entero >= 0'),
]), controller.updateStock);
exports.default = router;
