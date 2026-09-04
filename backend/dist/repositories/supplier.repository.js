"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierRepository = void 0;
const database_1 = require("../config/database");
class SupplierRepository {
    async getCurrentBatch() {
        const batchQuery = `
      SELECT * FROM supplier_batches 
      WHERE status = 'EN_ACUMULACION' 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
        const batchRes = await database_1.pool.query(batchQuery);
        if (!batchRes.rows[0])
            return null;
        const batch = batchRes.rows[0];
        const itemsQuery = `
      SELECT sbi.*, pv.variant_name, pv.sku, p.name as product_name
      FROM supplier_batch_items sbi
      JOIN product_variants pv ON sbi.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE sbi.batch_id = $1
    `;
        const itemsRes = await database_1.pool.query(itemsQuery, [batch.id]);
        return {
            ...batch,
            total_cost: parseFloat(batch.total_cost),
            items: itemsRes.rows.map((r) => ({
                ...r,
                unit_cost_agreed: parseFloat(r.unit_cost_agreed),
            })),
        };
    }
    async createOrConsolidateBatch(options) {
        const client = await database_1.pool.connect();
        try {
            await client.query('BEGIN');
            // Check if there is an active batch in accumulation
            const currentRes = await client.query(`SELECT * FROM supplier_batches WHERE status = 'EN_ACUMULACION' ORDER BY created_at DESC LIMIT 1`);
            let batch;
            if (currentRes.rows.length > 0) {
                batch = currentRes.rows[0];
            }
            else {
                const batchCode = `BATCH-${Date.now().toString(36).toUpperCase()}`;
                const insertBatchQuery = `
          INSERT INTO supplier_batches (batch_code, supplier_name, status, total_units, total_cost, notes)
          VALUES ($1, $2, 'EN_ACUMULACION', 0, 0, $3)
          RETURNING *
        `;
                const newBatchRes = await client.query(insertBatchQuery, [
                    batchCode,
                    options.supplierName || 'Importaciones Bogotá',
                    options.notes || null,
                ]);
                batch = newBatchRes.rows[0];
            }
            // If items were provided, add or update batch items
            if (options.items && options.items.length > 0) {
                for (const item of options.items) {
                    const varQuery = `SELECT id, wholesale_price FROM product_variants WHERE id = $1`;
                    const varRes = await client.query(varQuery, [item.variant_id]);
                    if (varRes.rows.length === 0)
                        continue;
                    const variant = varRes.rows[0];
                    const unitCost = parseFloat(variant.wholesale_price);
                    const existingItemRes = await client.query(`SELECT * FROM supplier_batch_items WHERE batch_id = $1 AND variant_id = $2`, [batch.id, item.variant_id]);
                    if (existingItemRes.rows.length > 0) {
                        await client.query(`UPDATE supplier_batch_items 
               SET quantity_ordered = quantity_ordered + $1, unit_cost_agreed = $2 
               WHERE id = $3`, [item.quantity, unitCost, existingItemRes.rows[0].id]);
                    }
                    else {
                        await client.query(`INSERT INTO supplier_batch_items (batch_id, variant_id, quantity_ordered, unit_cost_agreed, quantity_received)
               VALUES ($1, $2, $3, $4, 0)`, [batch.id, item.variant_id, item.quantity, unitCost]);
                    }
                }
            }
            // Recalculate totals
            const totalsRes = await client.query(`
        SELECT 
          COALESCE(SUM(quantity_ordered), 0) as total_units,
          COALESCE(SUM(quantity_ordered * unit_cost_agreed), 0) as total_cost
        FROM supplier_batch_items
        WHERE batch_id = $1
      `, [batch.id]);
            const totalUnits = parseInt(totalsRes.rows[0].total_units, 10);
            const totalCost = parseFloat(totalsRes.rows[0].total_cost);
            const updateBatchRes = await client.query(`UPDATE supplier_batches SET total_units = $1, total_cost = $2 WHERE id = $3 RETURNING *`, [totalUnits, totalCost, batch.id]);
            batch = updateBatchRes.rows[0];
            // Fetch items
            const itemsRes = await client.query(`
        SELECT sbi.*, pv.variant_name, pv.sku, p.name as product_name
        FROM supplier_batch_items sbi
        JOIN product_variants pv ON sbi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE sbi.batch_id = $1
      `, [batch.id]);
            await client.query('COMMIT');
            return {
                ...batch,
                total_cost: parseFloat(batch.total_cost),
                items: itemsRes.rows.map((r) => ({
                    ...r,
                    unit_cost_agreed: parseFloat(r.unit_cost_agreed),
                })),
            };
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    }
}
exports.SupplierRepository = SupplierRepository;
