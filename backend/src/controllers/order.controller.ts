import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse, PaginatedResponse, OrderDetail, Order, OrderStatus, PaymentStatus } from '../types';

export class OrderController {
  private service = new OrderService();

  create = async (
    req: Request,
    res: Response<ApiResponse<OrderDetail>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const order = await this.service.createOrder(req.body);
      res.status(201).json({
        success: true,
        data: order,
        message: `Pedido ${order.order_code} generado exitosamente`,
      });
    } catch (err) {
      next(err);
    }
  };

  getAll = async (
    req: Request,
    res: Response<PaginatedResponse<OrderDetail>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const status = req.query.status as OrderStatus | undefined;
      const paymentStatus = req.query.payment_status as PaymentStatus | undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

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
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request,
    res: Response<ApiResponse<OrderDetail>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const order = await this.service.getOrderById(id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (
    req: Request,
    res: Response<ApiResponse<Order>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const order = await this.service.updateOrderStatus(id, req.body);
      res.json({
        success: true,
        data: order,
        message: 'Estado del pedido actualizado',
      });
    } catch (err) {
      next(err);
    }
  };

  getFinancialSummary = async (
    _req: Request,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const summary = await this.service.getFinancialSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  };

  wompiWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.handleWompiWebhook(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
