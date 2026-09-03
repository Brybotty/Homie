import { OrderRepository } from '../repositories/order.repository';
import {
  Order,
  OrderDetail,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderStatus,
  PaymentStatus,
  OrderFinancialSummary,
} from '../types';
import { AppError } from '../middleware/errorHandler';

export class OrderService {
  private repo = new OrderRepository();

  async createOrder(dto: CreateOrderDto): Promise<OrderDetail> {
    if (!dto.items || dto.items.length === 0) {
      throw new AppError('El pedido debe tener al menos un ítem', 400);
    }
    if (!dto.customer || !dto.customer.phone || !dto.customer.full_name || !dto.customer.address) {
      throw new AppError('Datos del cliente incompletos (nombre, teléfono y dirección son obligatorios)', 400);
    }

    return this.repo.createOrder(dto);
  }

  async getOrders(options: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ orders: OrderDetail[]; total: number }> {
    return this.repo.findAll(options);
  }

  async getOrderById(id: number): Promise<OrderDetail> {
    const order = await this.repo.findById(id);
    if (!order) {
      throw new AppError(`Pedido con ID ${id} no encontrado`, 404);
    }
    return order;
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    await this.getOrderById(id);
    const updated = await this.repo.updateStatus(id, dto);
    if (!updated) {
      throw new AppError('Error al actualizar el estado del pedido', 500);
    }
    return updated;
  }

  async getFinancialSummary(): Promise<OrderFinancialSummary[]> {
    return this.repo.getFinancialSummary();
  }

  async handleWompiWebhook(payload: any): Promise<{ received: boolean; status?: string }> {
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
    } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
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
