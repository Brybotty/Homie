import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { OrderController } from '../controllers/order.controller';
import { validate } from '../middleware/validateDto';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const controller = new OrderController();

// GET /api/orders — solo administrador
router.get(
  '/',
  requireAdmin,
  validate([
    query('status').optional().isIn(['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO']),
    query('payment_status').optional().isIn(['PENDIENTE', 'PAGADO', 'CONTRAENTREGA', 'RECHAZADO', 'REEMBOLSADO']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  controller.getAll
);

// GET /api/orders/financial/summary — solo administrador
router.get('/financial/summary', requireAdmin, controller.getFinancialSummary);

// GET /api/orders/:id — solo administrador
router.get(
  '/:id',
  requireAdmin,
  validate([param('id').isInt().withMessage('El ID debe ser un número entero')]),
  controller.getById
);

// POST /api/orders — usuario autenticado con Google (cliente)
router.post(
  '/',
  requireAuth,
  validate([
    body('customer.full_name').trim().notEmpty().withMessage('El nombre completo del cliente es requerido'),
    body('customer.phone').trim().notEmpty().withMessage('El teléfono del cliente es requerido'),
    body('customer.address').trim().notEmpty().withMessage('La dirección es requerida'),
    body('customer.city').trim().notEmpty().withMessage('La ciudad es requerida'),
    body('customer.department').trim().notEmpty().withMessage('El departamento es requerido'),
    body('items').isArray({ min: 1 }).withMessage('La orden debe contener al menos un producto'),
    body('items.*.variant_id').isInt().withMessage('El variant_id debe ser un entero'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
    body('shipping_cost').optional().isFloat({ min: 0 }),
    body('discount_amount').optional().isFloat({ min: 0 }),
    body('payment_method').optional().isIn(['WOMPI', 'NEQUI', 'PSE', 'CONTRAENTREGA', 'TRANSFERENCIA', 'TARJETA']),
  ]),
  controller.create
);

// PATCH /api/orders/:id/status — solo administrador
router.patch(
  '/:id/status',
  requireAdmin,
  validate([
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    body('order_status').optional().isIn(['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO']),
    body('payment_status').optional().isIn(['PENDIENTE', 'PAGADO', 'CONTRAENTREGA', 'RECHAZADO', 'REEMBOLSADO']),
    body('shipping_carrier').optional().isString().trim(),
    body('tracking_number').optional().isString().trim(),
    body('delivery_notes').optional().isString(),
  ]),
  controller.updateStatus
);

// POST /api/orders/:id/sync-wompi — sincronizar manualmente con Wompi (solo administrador)
router.post(
  '/:id/sync-wompi',
  requireAdmin,
  validate([param('id').isInt().withMessage('El ID debe ser un número entero')]),
  controller.syncWompi
);

// POST /api/orders/wompi-webhook — Webhook oficial para actualización de pagos de Wompi (público)
router.post('/wompi-webhook', controller.wompiWebhook);

export default router;
