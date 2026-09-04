"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const order_controller_1 = require("../controllers/order.controller");
const validateDto_1 = require("../middleware/validateDto");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const controller = new order_controller_1.OrderController();
// GET /api/orders — solo administrador
router.get('/', authMiddleware_1.requireAdmin, (0, validateDto_1.validate)([
    (0, express_validator_1.query)('status').optional().isIn(['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO']),
    (0, express_validator_1.query)('payment_status').optional().isIn(['PENDIENTE', 'PAGADO', 'CONTRAENTREGA', 'RECHAZADO', 'REEMBOLSADO']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
]), controller.getAll);
// GET /api/orders/financial/summary — solo administrador
router.get('/financial/summary', authMiddleware_1.requireAdmin, controller.getFinancialSummary);
// GET /api/orders/:id — solo administrador
router.get('/:id', authMiddleware_1.requireAdmin, (0, validateDto_1.validate)([(0, express_validator_1.param)('id').isInt().withMessage('El ID debe ser un número entero')]), controller.getById);
// POST /api/orders — usuario autenticado con Google (cliente)
router.post('/', authMiddleware_1.requireAuth, (0, validateDto_1.validate)([
    (0, express_validator_1.body)('customer.full_name').trim().notEmpty().withMessage('El nombre completo del cliente es requerido'),
    (0, express_validator_1.body)('customer.phone').trim().notEmpty().withMessage('El teléfono del cliente es requerido'),
    (0, express_validator_1.body)('customer.address').trim().notEmpty().withMessage('La dirección es requerida'),
    (0, express_validator_1.body)('customer.city').trim().notEmpty().withMessage('La ciudad es requerida'),
    (0, express_validator_1.body)('customer.department').trim().notEmpty().withMessage('El departamento es requerido'),
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('La orden debe contener al menos un producto'),
    (0, express_validator_1.body)('items.*.variant_id').isInt().withMessage('El variant_id debe ser un entero'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
    (0, express_validator_1.body)('shipping_cost').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('discount_amount').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('payment_method').optional().isIn(['WOMPI', 'NEQUI', 'PSE', 'CONTRAENTREGA', 'TRANSFERENCIA', 'TARJETA']),
]), controller.create);
// PATCH /api/orders/:id/status — solo administrador
router.patch('/:id/status', authMiddleware_1.requireAdmin, (0, validateDto_1.validate)([
    (0, express_validator_1.param)('id').isInt().withMessage('El ID debe ser un número entero'),
    (0, express_validator_1.body)('order_status').optional().isIn(['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO']),
    (0, express_validator_1.body)('payment_status').optional().isIn(['PENDIENTE', 'PAGADO', 'CONTRAENTREGA', 'RECHAZADO', 'REEMBOLSADO']),
    (0, express_validator_1.body)('shipping_carrier').optional().isString().trim(),
    (0, express_validator_1.body)('tracking_number').optional().isString().trim(),
    (0, express_validator_1.body)('delivery_notes').optional().isString(),
]), controller.updateStatus);
// POST /api/orders/wompi-webhook — Webhook oficial para actualización de pagos de Wompi (público)
router.post('/wompi-webhook', controller.wompiWebhook);
exports.default = router;
