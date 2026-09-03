import { Router } from 'express';
import { body, param } from 'express-validator';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validateDto';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.getAll);

router.get(
  '/:id',
  validate([param('id').isInt().withMessage('El ID debe ser un número entero')]),
  controller.getById
);

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
    body('slug').trim().notEmpty().withMessage('El slug es obligatorio').isLength({ max: 120 }),
    body('description').optional().isString(),
    body('image_url').optional().isString(),
    body('is_active').optional().isBoolean(),
  ]),
  controller.create
);

router.put(
  '/:id',
  validate([
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    body('name').optional().trim().notEmpty().isLength({ max: 100 }),
    body('slug').optional().trim().notEmpty().isLength({ max: 120 }),
    body('description').optional().isString(),
    body('image_url').optional().isString(),
    body('is_active').optional().isBoolean(),
  ]),
  controller.update
);

router.delete(
  '/:id',
  validate([param('id').isInt().withMessage('El ID debe ser un número entero')]),
  controller.delete
);

export default router;
