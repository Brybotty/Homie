import { pool } from '../config/database';
import {
  Order,
  OrderItem,
  OrderDetail,
  Customer,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderStatus,
  PaymentStatus,
  OrderFinancialSummary,
} from '../types';
import { AppError } from '../middleware/errorHandler';

export class OrderRepository {
  private generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HOM-${timestamp}-${random}`;
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderDetail> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Upsert Customer by Phone
      const custFindQuery = 'SELECT * FROM customers WHERE phone = $1';
      const custFindRes = await client.query<Customer>(custFindQuery, [dto.customer.phone]);
      let customer: Customer;

      if (custFindRes.rows.length > 0) {
        const existingCust = custFindRes.rows[0];
        const updateCustQuery = `
          UPDATE customers 
          SET full_name = $1, email = COALESCE($2, email), document_id = COALESCE($3, document_id),
              address = $4, neighborhood = COALESCE($5, neighborhood), city = $6, department = $7, notes = COALESCE($8, notes)
          WHERE id = $9
          RETURNING *
        `;
        const updateCustRes = await client.query<Customer>(updateCustQuery, [
          dto.customer.full_name,
          dto.customer.email || null,
          dto.customer.document_id || null,
          dto.customer.address,
          dto.customer.neighborhood || null,
          dto.customer.city,
          dto.customer.department,
          dto.customer.notes || null,
          existingCust.id,
        ]);
        customer = updateCustRes.rows[0];
      } else {
        const insertCustQuery = `
          INSERT INTO customers (full_name, email, phone, document_id, address, neighborhood, city, department, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        const insertCustRes = await client.query<Customer>(insertCustQuery, [
          dto.customer.full_name,
          dto.customer.email || null,
          dto.customer.phone,
          dto.customer.document_id || null,
          dto.customer.address,
          dto.customer.neighborhood || null,
          dto.customer.city,
          dto.customer.department,
          dto.customer.notes || null,
        ]);
        customer = insertCustRes.rows[0];
      }

      // 2. Validate Items, Stock and Calculate Snapshots
      let subtotal = 0;
      const preparedItems: {
        variant_id: number;
        product_name_snapshot: string;
        variant_name_snapshot: string;
        sku_snapshot: string;
        unit_price: number;
        unit_cost: number;
        quantity: number;
        total_price: number;
      }[] = [];

      for (const item of dto.items) {
        const variantQuery = `
          SELECT pv.*, p.name as product_name
          FROM product_variants pv
          JOIN products p ON pv.product_id = p.id
          WHERE pv.id = $1
          FOR UPDATE
        `;
        const variantRes = await client.query(variantQuery, [item.variant_id]);
        if (variantRes.rows.length === 0) {
          throw new AppError(`Variante con ID ${item.variant_id} no existe`, 400);
        }

        const variant = variantRes.rows[0];
        if (!variant.is_active) {
          throw new AppError(`La variante '${variant.variant_name}' no está activa`, 400);
        }

        if (variant.stock_quantity < item.quantity) {
          throw new AppError(
            `Stock insuficiente para '${variant.product_name} - ${variant.variant_name}'. Disponible: ${variant.stock_quantity}, Solicitado: ${item.quantity}`,
            400
          );
        }

        const unitPrice = parseFloat(variant.retail_price);
        const unitCost = parseFloat(variant.wholesale_price);
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;

        preparedItems.push({
          variant_id: variant.id,
          product_name_snapshot: variant.product_name,
          variant_name_snapshot: variant.variant_name,
          sku_snapshot: variant.sku,
          unit_price: unitPrice,
          unit_cost: unitCost,
          quantity: item.quantity,
          total_price: itemTotal,
        });
      }

      // 3. Create Order
      const shippingCost = dto.shipping_cost || 0;
      const discountAmount = dto.discount_amount || 0;
      const totalAmount = Math.max(0, subtotal + shippingCost - discountAmount);
      const orderCode = this.generateOrderCode();
      const initialPaymentStatus = dto.payment_method === 'CONTRAENTREGA' ? 'CONTRAENTREGA' : 'PENDIENTE';

      const insertOrderQuery = `
        INSERT INTO orders (
          customer_id, order_code, subtotal, shipping_cost, discount_amount, total_amount,
          order_status, payment_status, payment_method, delivery_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const orderValues = [
        customer.id,
        orderCode,
        subtotal,
        shippingCost,
        discountAmount,
        totalAmount,
        'PENDIENTE',
        initialPaymentStatus,
        dto.payment_method || null,
        dto.delivery_notes || null,
      ];
      const orderRes = await client.query<Order>(insertOrderQuery, orderValues);
      const order = orderRes.rows[0];

      // 4. Insert Order Items & Discount Stock
      const insertedItems: OrderItem[] = [];
      const insertItemQuery = `
        INSERT INTO order_items (
          order_id, variant_id, product_name_snapshot, variant_name_snapshot,
          sku_snapshot, unit_price, unit_cost, quantity, total_price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const updateStockQuery = `
        UPDATE product_variants
        SET stock_quantity = stock_quantity - $1
        WHERE id = $2
      `;

      for (const prep of preparedItems) {
        const itemRes = await client.query<OrderItem>(insertItemQuery, [
          order.id,
          prep.variant_id,
          prep.product_name_snapshot,
          prep.variant_name_snapshot,
          prep.sku_snapshot,
          prep.unit_price,
          prep.unit_cost,
          prep.quantity,
          prep.total_price,
        ]);
        insertedItems.push(itemRes.rows[0]);

        await client.query(updateStockQuery, [prep.quantity, prep.variant_id]);
      }

      await client.query('COMMIT');

      return {
        ...order,
        customer,
        items: insertedItems,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findAll(options: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ orders: OrderDetail[]; total: number }> {
    const { status, paymentStatus, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`o.order_status = $${idx++}`);
      values.push(status);
    }
    if (paymentStatus) {
      conditions.push(`o.payment_status = $${idx++}`);
      values.push(paymentStatus);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(o.id) as total FROM orders o ${whereClause}`;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const dataQuery = `
      SELECT 
        o.*,
        to_json(c.*) as customer,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'variant_id', oi.variant_id,
              'product_name_snapshot', oi.product_name_snapshot,
              'variant_name_snapshot', oi.variant_name_snapshot,
              'sku_snapshot', oi.sku_snapshot,
              'unit_price', oi.unit_price::float,
              'unit_cost', oi.unit_cost::float,
              'quantity', oi.quantity,
              'total_price', oi.total_price::float,
              'created_at', oi.created_at
            ) ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, c.id
      ORDER BY o.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const result = await pool.query(dataQuery, values);
    const orders: OrderDetail[] = result.rows.map((row) => ({
      ...row,
      subtotal: parseFloat(row.subtotal),
      shipping_cost: parseFloat(row.shipping_cost),
      discount_amount: parseFloat(row.discount_amount),
      total_amount: parseFloat(row.total_amount),
      customer: typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    }));

    return { orders, total };
  }

  async findById(id: number): Promise<OrderDetail | null> {
    const query = `
      SELECT 
        o.*,
        to_json(c.*) as customer,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'variant_id', oi.variant_id,
              'product_name_snapshot', oi.product_name_snapshot,
              'variant_name_snapshot', oi.variant_name_snapshot,
              'sku_snapshot', oi.sku_snapshot,
              'unit_price', oi.unit_price::float,
              'unit_cost', oi.unit_cost::float,
              'quantity', oi.quantity,
              'total_price', oi.total_price::float,
              'created_at', oi.created_at
            ) ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id, c.id
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      ...row,
      subtotal: parseFloat(row.subtotal),
      shipping_cost: parseFloat(row.shipping_cost),
      discount_amount: parseFloat(row.discount_amount),
      total_amount: parseFloat(row.total_amount),
      customer: typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    };
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Obtener la orden actual bloqueando la fila
      const currentOrderRes = await client.query<Order>(
        'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
        [id]
      );
      if (currentOrderRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      const currentOrder = currentOrderRes.rows[0];
      const previousStatus = currentOrder.order_status;
      const targetStatus = dto.order_status;

      // 2. Gestión automática de inventario/stock según cambio de estado
      if (targetStatus && targetStatus !== previousStatus) {
        const itemsRes = await client.query<OrderItem>(
          'SELECT * FROM order_items WHERE order_id = $1',
          [id]
        );
        const items = itemsRes.rows;

        // Si cambia a CANCELADO desde cualquier estado activo -> REGRESAR PRODUCTOS A STOCK
        if (targetStatus === 'CANCELADO' && previousStatus !== 'CANCELADO') {
          for (const item of items) {
            if (item.variant_id) {
              await client.query(
                `UPDATE product_variants 
                 SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [item.quantity, item.variant_id]
              );
            }
          }
        }
        // Si se reactiva una orden que estaba CANCELADA -> VOLVER A DESCONTAR STOCK
        else if (previousStatus === 'CANCELADO' && targetStatus !== 'CANCELADO') {
          for (const item of items) {
            if (item.variant_id) {
              const variantRes = await client.query(
                'SELECT stock_quantity, variant_name FROM product_variants WHERE id = $1 FOR UPDATE',
                [item.variant_id]
              );
              if (variantRes.rows.length > 0) {
                const available = variantRes.rows[0].stock_quantity;
                if (available < item.quantity) {
                  throw new AppError(
                    `Stock insuficiente para reactivar el pedido. Disponible: ${available}, Requerido: ${item.quantity}`,
                    400
                  );
                }
              }
              await client.query(
                `UPDATE product_variants 
                 SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [item.quantity, item.variant_id]
              );
            }
          }
        }
      }

      // 3. Actualizar los campos del pedido
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (dto.order_status !== undefined) {
        fields.push(`order_status = $${idx++}`);
        values.push(dto.order_status);
      }
      if (dto.payment_status !== undefined) {
        fields.push(`payment_status = $${idx++}`);
        values.push(dto.payment_status);
      }
      if (dto.shipping_carrier !== undefined) {
        fields.push(`shipping_carrier = $${idx++}`);
        values.push(dto.shipping_carrier);
      }
      if (dto.tracking_number !== undefined) {
        fields.push(`tracking_number = $${idx++}`);
        values.push(dto.tracking_number);
      }
      if (dto.delivery_notes !== undefined) {
        fields.push(`delivery_notes = $${idx++}`);
        values.push(dto.delivery_notes);
      }

      let updatedOrder: Order = currentOrder;
      if (fields.length > 0) {
        values.push(id);
        const query = `
          UPDATE orders
          SET ${fields.join(', ')}
          WHERE id = $${idx}
          RETURNING *
        `;
        const result = await client.query<Order>(query, values);
        updatedOrder = result.rows[0];
      }

      await client.query('COMMIT');
      return updatedOrder;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getFinancialSummary(): Promise<OrderFinancialSummary[]> {
    const query = 'SELECT * FROM v_order_financial_summary ORDER BY created_at DESC';
    const result = await pool.query<OrderFinancialSummary>(query);
    return result.rows.map((row) => ({
      ...row,
      revenue_total: parseFloat(row.revenue_total as any),
      total_cogs_mayorista: parseFloat(row.total_cogs_mayorista as any),
      shipping_cost: parseFloat(row.shipping_cost as any),
      gross_profit: parseFloat(row.gross_profit as any),
    }));
  }

  async findByCode(orderCode: string): Promise<Order | null> {
    const res = await pool.query<Order>('SELECT * FROM orders WHERE order_code = $1', [orderCode]);
    return res.rows[0] || null;
  }
}
