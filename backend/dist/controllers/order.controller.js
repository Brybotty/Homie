"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
class OrderController {
    service = new order_service_1.OrderService();
    create = async (req, res, next) => {
        try {
            const order = await this.service.createOrder(req.body);
            res.status(201).json({
                success: true,
                data: order,
                message: `Pedido ${order.order_code} generado exitosamente`,
            });
        }
        catch (err) {
            next(err);
        }
    };
    getAll = async (req, res, next) => {
        try {
            const status = req.query.status;
            const paymentStatus = req.query.payment_status;
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
            const { orders, total } = await this.service.getOrders({
                status,
                paymentStatus,
                page,
                limit,
            });
            res.json({
                success: true,
                data: orders,
                total,
                page,
                limit,
            });
        }
        catch (err) {
            next(err);
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const order = await this.service.getOrderById(id);
            res.json({ success: true, data: order });
        }
        catch (err) {
            next(err);
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const order = await this.service.updateOrderStatus(id, req.body);
            res.json({
                success: true,
                data: order,
                message: 'Estado del pedido actualizado',
            });
        }
        catch (err) {
            next(err);
        }
    };
    getFinancialSummary = async (_req, res, next) => {
        try {
            const summary = await this.service.getFinancialSummary();
            res.json({ success: true, data: summary });
        }
        catch (err) {
            next(err);
        }
    };
    wompiWebhook = async (req, res, next) => {
        try {
            const result = await this.service.handleWompiWebhook(req.body);
            if (result.error) {
                res.status(400).json({ success: false, message: result.error });
                return;
            }
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    syncWompi = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const order = await this.service.syncWompiStatusByOrder(id);
            res.json({
                success: true,
                data: order,
                message: 'Estado de la orden sincronizado con Wompi',
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.OrderController = OrderController;
