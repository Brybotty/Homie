"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const order_repository_1 = require("../repositories/order.repository");
const errorHandler_1 = require("../middleware/errorHandler");
class OrderService {
    repo = new order_repository_1.OrderRepository();
    async createOrder(dto) {
        if (!dto.items || dto.items.length === 0) {
            throw new errorHandler_1.AppError('El pedido debe tener al menos un ítem', 400);
        }
        if (!dto.customer || !dto.customer.phone || !dto.customer.full_name || !dto.customer.address) {
            throw new errorHandler_1.AppError('Datos del cliente incompletos (nombre, teléfono y dirección son obligatorios)', 400);
        }
        return this.repo.createOrder(dto);
    }
    async getOrders(options) {
        return this.repo.findAll(options);
    }
    async getOrderById(id) {
        const order = await this.repo.findById(id);
        if (!order) {
            throw new errorHandler_1.AppError(`Pedido con ID ${id} no encontrado`, 404);
        }
        return order;
    }
    async updateOrderStatus(id, dto) {
        await this.getOrderById(id);
        const updated = await this.repo.updateStatus(id, dto);
        if (!updated) {
            throw new errorHandler_1.AppError('Error al actualizar el estado del pedido', 500);
        }
        return updated;
    }
    async getFinancialSummary() {
        return this.repo.getFinancialSummary();
    }
    async handleWompiWebhook(payload) {
        const transaction = payload?.data?.transaction;
        if (!transaction || !transaction.reference) {
            return { received: true };
        }
        const order = await this.repo.findByCode(transaction.reference);
        if (!order) {
            console.warn(`[Wompi Webhook] Orden con código ${transaction.reference} no encontrada`);
            return { received: true };
        }
        if (transaction.status === 'APPROVED') {
            if (order.payment_status !== 'PAGADO') {
                await this.repo.updateStatus(order.id, {
                    order_status: 'CONFIRMADO',
                    payment_status: 'PAGADO',
                    delivery_notes: (order.delivery_notes ? order.delivery_notes + ' | ' : '') + `[Aprobado Wompi Ref: ${transaction.id}]`,
                });
                console.log(`✅ [Wompi Webhook] Orden ${order.order_code} marcada como CONFIRMADO y PAGADO.`);
            }
        }
        else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
            if (order.order_status !== 'CANCELADO') {
                await this.repo.updateStatus(order.id, {
                    order_status: 'CANCELADO',
                    payment_status: 'RECHAZADO',
                    delivery_notes: (order.delivery_notes ? order.delivery_notes + ' | ' : '') + `[Rechazado Wompi Ref: ${transaction.id}]`,
                });
                console.log(`❌ [Wompi Webhook] Orden ${order.order_code} cancelada por pago rechazado. Stock devuelto.`);
            }
        }
        return { received: true, status: transaction.status };
    }
}
exports.OrderService = OrderService;
