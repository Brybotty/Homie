import { pool } from '../config/database';
import { Collection, CreateCollectionDto, UpdateCollectionDto } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CollectionRepository {
  async findAll(options: { isActive?: boolean } = {}): Promise<Collection[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (options.isActive !== undefined) {
      conditions.push(`c.is_active = $${idx++}`);
      values.push(options.isActive);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT pc.product_id)::int as product_count,
        COALESCE(
          array_agg(pc.product_id) FILTER (WHERE pc.product_id IS NOT NULL),
          ARRAY[]::int[]
        ) as product_ids
      FROM collections c
      LEFT JOIN product_collections pc ON c.id = pc.collection_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  async findById(id: number): Promise<Collection | null> {
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT pc.product_id)::int as product_count,
        COALESCE(
          array_agg(pc.product_id) FILTER (WHERE pc.product_id IS NOT NULL),
          ARRAY[]::int[]
        ) as product_ids
      FROM collections c
      LEFT JOIN product_collections pc ON c.id = pc.collection_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findBySlug(slug: string): Promise<Collection | null> {
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT pc.product_id)::int as product_count,
        COALESCE(
          array_agg(pc.product_id) FILTER (WHERE pc.product_id IS NOT NULL),
          ARRAY[]::int[]
        ) as product_ids
      FROM collections c
      LEFT JOIN product_collections pc ON c.id = pc.collection_id
      WHERE c.slug = $1
      GROUP BY c.id
    `;
    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
  }

  async create(data: CreateCollectionDto): Promise<Collection> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO collections (name, slug, description, image_url, icon_svg, badge, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [
        data.name.trim(),
        data.slug.trim().toLowerCase(),
        data.description || null,
        data.image_url || null,
        data.icon_svg || null,
        data.badge || null,
        data.display_order ?? 0,
        data.is_active ?? true,
      ];

      const res = await client.query(insertQuery, values);
      const collection = res.rows[0];

      if (data.product_ids && data.product_ids.length > 0) {
        for (const pId of data.product_ids) {
          await client.query(
            `INSERT INTO product_collections (product_id, collection_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [pId, collection.id]
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(collection.id) as Promise<Collection>;
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        throw new AppError('Ya existe una colección con ese slug/nombre.', 409);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: number, data: UpdateCollectionDto): Promise<Collection> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await this.findById(id);
      if (!existing) {
        throw new AppError('Colección no encontrada.', 404);
      }

      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${idx++}`);
        values.push(data.name.trim());
      }
      if (data.slug !== undefined) {
        updates.push(`slug = $${idx++}`);
        values.push(data.slug.trim().toLowerCase());
      }
      if (data.description !== undefined) {
        updates.push(`description = $${idx++}`);
        values.push(data.description);
      }
      if (data.image_url !== undefined) {
        updates.push(`image_url = $${idx++}`);
        values.push(data.image_url);
      }
      if (data.icon_svg !== undefined) {
        updates.push(`icon_svg = $${idx++}`);
        values.push(data.icon_svg);
      }
      if (data.badge !== undefined) {
        updates.push(`badge = $${idx++}`);
        values.push(data.badge);
      }
      if (data.display_order !== undefined) {
        updates.push(`display_order = $${idx++}`);
        values.push(data.display_order);
      }
      if (data.is_active !== undefined) {
        updates.push(`is_active = $${idx++}`);
        values.push(data.is_active);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        const query = `
          UPDATE collections
          SET ${updates.join(', ')}
          WHERE id = $${idx}
        `;
        values.push(id);
        await client.query(query, values);
      }

      // Si se enviaron product_ids, sincronizar relación sin alterar category_id de ningún producto
      if (data.product_ids !== undefined) {
        await client.query(`DELETE FROM product_collections WHERE collection_id = $1`, [id]);
        for (const pId of data.product_ids) {
          await client.query(
            `INSERT INTO product_collections (product_id, collection_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [pId, id]
          );
        }
      }

      await client.query('COMMIT');
      return (await this.findById(id))!;
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        throw new AppError('Ya existe una colección con ese slug.', 409);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async setProducts(collectionId: number, productIds: number[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM product_collections WHERE collection_id = $1`, [collectionId]);
      for (const pId of productIds) {
        await client.query(
          `INSERT INTO product_collections (product_id, collection_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [pId, collectionId]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM collections WHERE id = $1 RETURNING id`, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
