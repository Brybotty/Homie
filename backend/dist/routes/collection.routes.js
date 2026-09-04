"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const collection_controller_1 = require("../controllers/collection.controller");
const validateDto_1 = require("../middleware/validateDto");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const controller = new collection_controller_1.CollectionController();
// Rutas Públicas (para la tienda y las stories)
router.get('/', controller.getAll);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', (0, validateDto_1.validate)([(0, express_validator_1.param)('id').isInt().withMessage('ID inválido')]), controller.getById);
// Rutas Administrativas (protegidas)
router.post('/', authMiddleware_1.requireAdmin, (0, validateDto_1.validate)([
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    (0, express_validator_1.body)('slug').optional().trim(),
    (0, express_validator_1.body)('description').optional({ nullable: true }),
    (0, express_validator_1.body)('image_url').optional({ nullable: true }),
    (0, express_validator_1.body)('badge').optional({ nullable: true }),
    (0, express_validator_1.body)('display_order').optional().isInt(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
    (0, express_validator_1.body)('product_ids').optional().isArray(),
]), controller.create);
router.put('/:id', authMiddleware_1.requireAdmin, (0, validateDto_1.validate)([
    (0, express_validator_1.param)('id').isInt().withMessage('ID inválido'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    (0, express_validator_1.body)('slug').optional().trim(),
    (0, express_validator_1.body)('description').optional({ nullable: true }),
    (0, express_validator_1.body)('image_url').optional({ nullable: true }),
    (0, express_validator_1.body)('badge').optional({ nullable: true }),
    (0, express_validator_1.body)('display_order').optional().isInt(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
    (0, express_validator_1.body)('product_ids').optional().isArray(),
]), controller.update);
router.post('/:id/products', authMiddleware_1.requireAdmin, (0, validateDto_1.validate)([
    (0, express_validator_1.param)('id').isInt().withMessage('ID inválido'),
    (0, express_validator_1.body)('product_ids').isArray().withMessage('product_ids debe ser un arreglo de IDs'),
]), controller.setProducts);
router.delete('/:id', authMiddleware_1.requireAdmin, (0, validateDto_1.validate)([(0, express_validator_1.param)('id').isInt().withMessage('ID inválido')]), controller.delete);
exports.default = router;
