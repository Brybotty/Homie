import crypto from 'crypto';
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
      throw new AppError('Datos de contacto y entrega incompletos', 400);
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
      throw new AppError(`Orden #${id} no encontrada`, 404);
    }
    return order;
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    await this.getOrderById(id);
    const updated = await this.repo.updateStatus(id, dto);
    if (!updated) {
      throw new AppError('Error al actualizar el estado de la orden', 500);
    }
    return updated;
  }

  async getFinancialSummary(): Promise<OrderFinancialSummary[]> {
    return this.repo.getFinancialSummary();
  }

  /**
   * Valida la firma criptográfica (SHA256) de un evento enviado por Wompi usando WOMPI_EVENTS_SECRET.
   */
  verifyWompiSignature(payload: any): boolean {
    const secret = process.env.WOMPI_EVENTS_SECRET;
    if (!secret) {
      console.warn('⚠️ [Wompi Webhook] WOMPI_EVENTS_SECRET no configurado en .env, omitiendo validación criptográfica.');
      return true;
    }

    try {
      const { signature, timestamp, data } = payload || {};
      if (!signature?.checksum || !Array.isArray(signature?.properties) || !timestamp || !data) {
        return false;
      }

      let concatenated = '';
      for (const prop of signature.properties) {
        const parts = prop.split('.');
        let val: any = data;
        for (const part of parts) {
          val = val?.[part];
        }
        concatenated += val !== undefined && val !== null ? String(val) : '';
      }

      concatenated += String(timestamp) + secret;
      const expectedChecksum = crypto.createHash('sha256').update(concatenated).digest('hex');

      return signature.checksum.toLowerCase() === expectedChecksum.toLowerCase();
    } catch (err) {
      console.error('❌ [Wompi Webhook] Error al validar firma:', err);
      return false;
    }
  }

  async handleWompiWebhook(payload: any): Promise<{ received: boolean; status?: string; error?: string }> {
    if (!this.verifyWompiSignature(payload)) {
      console.warn('⚠️ [Wompi Webhook] Firma de webhook inválida rechazada.');
      return { received: false, error: 'Firma de webhook inválida' };
    }

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

  /**
   * Consulta la API de Wompi con la Llave Privada para verificar el estado de una orden.
   */
  async syncWompiStatusByOrder(orderId: number): Promise<OrderDetail> {
    const order = await this.repo.findById(orderId);
    if (!order) {
      throw new AppError('Orden no encontrada', 404);
    }

    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    if (!privateKey) {
      throw new AppError('WOMPI_PRIVATE_KEY no está configurada', 500);
    }

    try {
      const response = await fetch(`https://production.wompi.co/v1/transactions?reference=${encodeURIComponent(order.order_code)}`, {
        headers: {
          Authorization: `Bearer ${privateKey}`,
        },
      });

      if (!response.ok) {
        throw new AppError(`Error consultando Wompi: HTTP ${response.status}`, 502);
      }

      const json: any = await response.json();
      const transactions = json?.data || [];

      const approvedTx = transactions.find((t: any) => t.status === 'APPROVED');
      if (approvedTx) {
        if (order.payment_status !== 'PAGADO') {
          await this.repo.updateStatus(order.id, {
            order_status: 'CONFIRMADO',
            payment_status: 'PAGADO',
            delivery_notes: (order.delivery_notes ? order.delivery_notes + ' | ' : '') + `[Sincronizado Wompi Ref: ${approvedTx.id}]`,
          });
          return (await this.getOrderById(order.id));
        }
      } else {
        const declinedTx = transactions.find((t: any) => t.status === 'DECLINED' || t.status === 'ERROR');
        if (declinedTx && order.order_status !== 'CANCELADO') {
          await this.repo.updateStatus(order.id, {
            order_status: 'CANCELADO',
            payment_status: 'RECHAZADO',
            delivery_notes: (order.delivery_notes ? order.delivery_notes + ' | ' : '') + `[Sincronizado Rechazado Wompi Ref: ${declinedTx.id}]`,
          });
          return (await this.getOrderById(order.id));
        }
      }

      return order;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Fallo al consultar Wompi: ${err.message}`, 502);
    }
  }
}
