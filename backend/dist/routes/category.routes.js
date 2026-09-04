"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const category_controller_1 = require("../controllers/category.controller");
const validateDto_1 = require("../middleware/validateDto");
const router = (0, express_1.Router)();
const controller = new category_controller_1.CategoryController();
router.get('/', controller.getAll);
router.get('/:id', (0, validateDto_1.validate)([(0, express_validator_1.param)('id').isInt().withMessage('El ID debe ser un número entero')]), controller.getById);
router.post('/', (0, validateDto_1.validate)([
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
    (0, express_validator_1.body)('slug').trim().notEmpty().withMessage('El slug es obligatorio').isLength({ max: 120 }),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('image_url').optional().isString(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
]), controller.create);
router.put('/:id', (0, validateDto_1.validate)([
    (0, express_validator_1.param)('id').isInt().withMessage('El ID debe ser un número entero'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty().isLength({ max: 100 }),
    (0, express_validator_1.body)('slug').optional().trim().notEmpty().isLength({ max: 120 }),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('image_url').optional().isString(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
]), controller.update);
router.delete('/:id', (0, validateDto_1.validate)([(0, express_validator_1.param)('id').isInt().withMessage('El ID debe ser un número entero')]), controller.delete);
exports.default = router;
