import { pool } from '../config/database';
import {
  Product,
  ProductVariant,
  ProductWithVariants,
  CreateProductDto,
  UpdateProductDto,
} from '../types';
import { AppError } from '../middleware/errorHandler';

export class ProductRepository {
  async findAll(options: {
    categorySlug?: string;
    collectionSlug?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: ProductWithVariants[]; total: number }> {
    const { categorySlug, collectionSlug, isActive, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    let joinCollectionFilter = '';
    if (collectionSlug) {
      joinCollectionFilter = `JOIN product_collections pc_f ON p.id = pc_f.product_id
                              JOIN collections coll_f ON pc_f.collection_id = coll_f.id AND coll_f.slug = $${idx++}`;
      values.push(collectionSlug);
    }

    if (categorySlug) {
      let normalizedSlug = categorySlug.toLowerCase().trim();
      if (normalizedSlug === 'termos' || normalizedSlug === 'termos-y-botellas') {
        normalizedSlug = 'termos-botellas';
      } else if (normalizedSlug === 'mug') {
        normalizedSlug = 'mugs';
      }
      conditions.push(`(c.slug = $${idx} OR c.parent_id = (SELECT id FROM categories WHERE slug = $${idx}))`);
      values.push(normalizedSlug);
      idx++;
    }
    if (isActive !== undefined) {
      conditions.push(`p.is_active = $${idx++}`);
      values.push(isActive);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinCollectionFilter}
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const dataQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.parent_id as category_parent_id,
        (SELECT parent_c.name FROM categories parent_c WHERE parent_c.id = c.parent_id) as parent_category_name,
        (
          SELECT COALESCE(array_agg(pc.collection_id), '{}')
          FROM product_collections pc
          WHERE pc.product_id = p.id
        ) as collection_ids,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'product_id', pv.product_id,
              'sku', pv.sku,
              'supplier_sku', pv.supplier_sku,
              'variant_name', pv.variant_name,
              'wholesale_price', pv.wholesale_price::float,
              'retail_price', pv.retail_price::float,
              'stock_quantity', pv.stock_quantity,
              'weight_grams', pv.weight_grams,
              'image_url', pv.image_url,
              'is_active', pv.is_active,
              'created_at', pv.created_at,
              'updated_at', pv.updated_at
            ) ORDER BY pv.id ASC
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'
        ) as variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      ${joinCollectionFilter}
      ${whereClause}
      GROUP BY p.id, c.id, c.name, c.slug, c.parent_id
      ORDER BY p.display_order ASC, p.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const result = await pool.query(dataQuery, values);
    const products: ProductWithVariants[] = result.rows.map((row) => ({
      ...row,
      variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants,
      collection_ids: Array.isArray(row.collection_ids) ? row.collection_ids : [],
    }));

    return { products, total };
  }

  async findBySlug(slug: string): Promise<ProductWithVariants | null> {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.parent_id as category_parent_id,
        (SELECT parent_c.name FROM categories parent_c WHERE parent_c.id = c.parent_id) as parent_category_name,
        (
          SELECT COALESCE(array_agg(pc.collection_id), '{}')
          FROM product_collections pc
          WHERE pc.product_id = p.id
        ) as collection_ids,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'product_id', pv.product_id,
              'sku', pv.sku,
              'supplier_sku', pv.supplier_sku,
              'variant_name', pv.variant_name,
              'wholesale_price', pv.wholesale_price::float,
              'retail_price', pv.retail_price::float,
              'stock_quantity', pv.stock_quantity,
              'weight_grams', pv.weight_grams,
              'image_url', pv.image_url,
              'is_active', pv.is_active,
              'created_at', pv.created_at,
              'updated_at', pv.updated_at
            ) ORDER BY pv.id ASC
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'
        ) as variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.slug = $1
      GROUP BY p.id, c.id, c.name, c.slug, c.parent_id
    `;
    const result = await pool.query(query, [slug]);
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      ...row,
      variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants,
      collection_ids: Array.isArray(row.collection_ids) ? row.collection_ids : [],
    };
  }

  async findById(id: number): Promise<ProductWithVariants | null> {
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.parent_id as category_parent_id,
        (SELECT parent_c.name FROM categories parent_c WHERE parent_c.id = c.parent_id) as parent_category_name,
        (
          SELECT COALESCE(array_agg(pc.collection_id), '{}')
          FROM product_collections pc
          WHERE pc.product_id = p.id
        ) as collection_ids,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'product_id', pv.product_id,
              'sku', pv.sku,
              'supplier_sku', pv.supplier_sku,
              'variant_name', pv.variant_name,
              'wholesale_price', pv.wholesale_price::float,
              'retail_price', pv.retail_price::float,
              'stock_quantity', pv.stock_quantity,
              'weight_grams', pv.weight_grams,
              'image_url', pv.image_url,
              'is_active', pv.is_active,
              'created_at', pv.created_at,
              'updated_at', pv.updated_at
            ) ORDER BY pv.id ASC
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'
        ) as variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.id, c.name, c.slug, c.parent_id
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      ...row,
      variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants,
      collection_ids: Array.isArray(row.collection_ids) ? row.collection_ids : [],
    };
  }

  async createWithVariants(dto: CreateProductDto): Promise<ProductWithVariants> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertProductQuery = `
        INSERT INTO products (category_id, name, slug, description, short_description, featured_image_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const productValues = [
        dto.category_id || null,
        dto.name,
        dto.slug,
        dto.description || null,
        dto.short_description || null,
        dto.featured_image_url || null,
        dto.is_active !== undefined ? dto.is_active : true,
      ];
      const productResult = await client.query<Product>(insertProductQuery, productValues);
      const product = productResult.rows[0];

      const insertedVariants: ProductVariant[] = [];
      const insertVariantQuery = `
        INSERT INTO product_variants (
          product_id, sku, supplier_sku, variant_name,
          wholesale_price, retail_price, stock_quantity, weight_grams,
          image_url, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      for (const v of dto.variants) {
        const variantValues = [
          product.id,
          v.sku,
          v.supplier_sku || null,
          v.variant_name,
          v.wholesale_price,
          v.retail_price,
          v.stock_quantity !== undefined ? v.stock_quantity : 0,
          v.weight_grams !== undefined ? v.weight_grams : 350,
          v.image_url || null,
          v.is_active !== undefined ? v.is_active : true,
        ];
        const variantResult = await client.query<ProductVariant>(insertVariantQuery, variantValues);
        insertedVariants.push(variantResult.rows[0]);
      }

      if (dto.collection_ids && Array.isArray(dto.collection_ids) && dto.collection_ids.length > 0) {
        for (const colId of dto.collection_ids) {
          await client.query(
            'INSERT INTO product_collections (product_id, collection_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [product.id, colId]
          );
        }
      }

      await client.query('COMMIT');

      return {
        ...product,
        variants: insertedVariants,
      };
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        if (err.constraint?.includes('sku')) {
          throw new AppError('El SKU de una de las variantes ya está en uso. Cada variante debe tener un SKU único.', 409, err.detail);
        }
        if (err.constraint?.includes('slug')) {
          throw new AppError('El slug ya está en uso por otro producto.', 409, err.detail);
        }
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async updateWithVariants(id: number, dto: UpdateProductDto): Promise<ProductWithVariants | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (dto.category_id !== undefined) {
        fields.push(`category_id = $${idx++}`);
        values.push(dto.category_id);
      }
      if (dto.name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(dto.name);
      }
      if (dto.slug !== undefined) {
        fields.push(`slug = $${idx++}`);
        values.push(dto.slug);
      }
      if (dto.description !== undefined) {
        fields.push(`description = $${idx++}`);
        values.push(dto.description);
      }
      if (dto.short_description !== undefined) {
        fields.push(`short_description = $${idx++}`);
        values.push(dto.short_description);
      }
      if (dto.featured_image_url !== undefined) {
        fields.push(`featured_image_url = $${idx++}`);
        values.push(dto.featured_image_url);
      }
      if (dto.is_active !== undefined) {
        fields.push(`is_active = $${idx++}`);
        values.push(dto.is_active);
      }

      if (fields.length > 0) {
        values.push(id);
        const query = `
          UPDATE products
          SET ${fields.join(', ')}
          WHERE id = $${idx}
          RETURNING *
        `;
        await client.query<Product>(query, values);
      }

      // Actualizar, insertar o eliminar variantes si vienen en el DTO
      if (dto.variants && Array.isArray(dto.variants)) {
        const incomingIds = dto.variants.filter((v) => v.id).map((v) => Number(v.id));

        // Obtener IDs de variantes actuales en BD para este producto
        const currentVariantsRes = await client.query<{ id: number }>(
          'SELECT id FROM product_variants WHERE product_id = $1',
          [id]
        );
        const currentIds = currentVariantsRes.rows.map((r) => r.id);
        const idsToRemove = currentIds.filter((dbId) => !incomingIds.includes(dbId));

        if (idsToRemove.length > 0) {
          // Si están en supplier_batch_items, no se pueden borrar físicamente -> desactivar
          // Si no tienen dependencias restrictivas, borrarlas
          await client.query(
            `DELETE FROM product_variants 
             WHERE product_id = $1 
               AND id = ANY($2::int[])
               AND id NOT IN (SELECT variant_id FROM supplier_batch_items WHERE variant_id IS NOT NULL)`,
            [id, idsToRemove]
          );
          await client.query(
            `UPDATE product_variants 
             SET is_active = false 
             WHERE product_id = $1 
               AND id = ANY($2::int[])`,
            [id, idsToRemove]
          );
        }

        for (const v of dto.variants) {
          if (v.id) {
            // Actualizar variante existente
            const vFields: string[] = [];
            const vValues: any[] = [];
            let vIdx = 1;

            if (v.sku !== undefined) {
              vFields.push(`sku = $${vIdx++}`);
              vValues.push(v.sku);
            }
            if (v.supplier_sku !== undefined) {
              vFields.push(`supplier_sku = $${vIdx++}`);
              vValues.push(v.supplier_sku);
            }
            if (v.variant_name !== undefined) {
              vFields.push(`variant_name = $${vIdx++}`);
              vValues.push(v.variant_name);
            }
            if (v.wholesale_price !== undefined) {
              vFields.push(`wholesale_price = $${vIdx++}`);
              vValues.push(v.wholesale_price);
            }
            if (v.retail_price !== undefined) {
              vFields.push(`retail_price = $${vIdx++}`);
              vValues.push(v.retail_price);
            }
            if (v.stock_quantity !== undefined) {
              vFields.push(`stock_quantity = $${vIdx++}`);
              vValues.push(v.stock_quantity);
            }
            if (v.weight_grams !== undefined) {
              vFields.push(`weight_grams = $${vIdx++}`);
              vValues.push(v.weight_grams);
            }
            if (v.image_url !== undefined) {
              vFields.push(`image_url = $${vIdx++}`);
              vValues.push(v.image_url);
            }
            if (v.is_active !== undefined) {
              vFields.push(`is_active = $${vIdx++}`);
              vValues.push(v.is_active);
            }

            if (vFields.length > 0) {
              vValues.push(v.id, id);
              const updateVQuery = `
                UPDATE product_variants
                SET ${vFields.join(', ')}
                WHERE id = $${vIdx++} AND product_id = $${vIdx}
              `;
              await client.query(updateVQuery, vValues);
            }
          } else if (v.sku && v.variant_name && v.wholesale_price !== undefined && v.retail_price !== undefined) {
            // Insertar nueva variante
            const insertVQuery = `
              INSERT INTO product_variants (
                product_id, sku, supplier_sku, variant_name,
                wholesale_price, retail_price, stock_quantity, weight_grams,
                image_url, is_active
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;
            await client.query(insertVQuery, [
              id,
              v.sku,
              v.supplier_sku || null,
              v.variant_name,
              v.wholesale_price,
              v.retail_price,
              v.stock_quantity !== undefined ? v.stock_quantity : 0,
              v.weight_grams !== undefined ? v.weight_grams : 350,
              v.image_url || null,
              v.is_active !== undefined ? v.is_active : true,
            ]);
          }
        }
      }

      if (dto.collection_ids !== undefined && Array.isArray(dto.collection_ids)) {
        await client.query('DELETE FROM product_collections WHERE product_id = $1', [id]);
        for (const colId of dto.collection_ids) {
          await client.query(
            'INSERT INTO product_collections (product_id, collection_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, colId]
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(id);
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '23505') {
        if (err.constraint?.includes('sku')) {
          throw new AppError('El SKU de una de las variantes ya está en uso. Cada variante debe tener un SKU único.', 409, err.detail);
        }
        if (err.constraint?.includes('slug')) {
          throw new AppError('El slug ya está en uso por otro producto.', 409, err.detail);
        }
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async updateBase(id: number, dto: UpdateProductDto): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.category_id !== undefined) {
      fields.push(`category_id = $${idx++}`);
      values.push(dto.category_id);
    }
    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(dto.slug);
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(dto.description);
    }
    if (dto.short_description !== undefined) {
      fields.push(`short_description = $${idx++}`);
      values.push(dto.short_description);
    }
    if (dto.featured_image_url !== undefined) {
      fields.push(`featured_image_url = $${idx++}`);
      values.push(dto.featured_image_url);
    }
    if (dto.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(dto.is_active);
    }

    if (fields.length === 0) {
      const res = await pool.query<Product>('SELECT * FROM products WHERE id = $1', [id]);
      return res.rows[0] || null;
    }

    values.push(id);
    const query = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const result = await pool.query<Product>(query, values);
    return result.rows[0] || null;
  }

  async updateVariantStock(variantId: number, stockQuantity: number): Promise<ProductVariant | null> {
    const query = `
      UPDATE product_variants
      SET stock_quantity = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query<ProductVariant>(query, [stockQuantity, variantId]);
    return result.rows[0] || null;
  }

  async updateVariant(variantId: number, dto: Partial<ProductVariant>): Promise<ProductVariant | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.sku !== undefined) {
      fields.push(`sku = $${idx++}`);
      values.push(dto.sku);
    }
    if (dto.supplier_sku !== undefined) {
      fields.push(`supplier_sku = $${idx++}`);
      values.push(dto.supplier_sku);
    }
    if (dto.variant_name !== undefined) {
      fields.push(`variant_name = $${idx++}`);
      values.push(dto.variant_name);
    }
    if (dto.wholesale_price !== undefined) {
      fields.push(`wholesale_price = $${idx++}`);
      values.push(dto.wholesale_price);
    }
    if (dto.retail_price !== undefined) {
      fields.push(`retail_price = $${idx++}`);
      values.push(dto.retail_price);
    }
    if (dto.stock_quantity !== undefined) {
      fields.push(`stock_quantity = $${idx++}`);
      values.push(dto.stock_quantity);
    }
    if (dto.weight_grams !== undefined) {
      fields.push(`weight_grams = $${idx++}`);
      values.push(dto.weight_grams);
    }
    if (dto.image_url !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(dto.image_url);
    }
    if (dto.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(dto.is_active);
    }

    if (fields.length === 0) {
      const res = await pool.query<ProductVariant>('SELECT * FROM product_variants WHERE id = $1', [variantId]);
      return res.rows[0] || null;
    }

    values.push(variantId);
    const query = `
      UPDATE product_variants
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const result = await pool.query<ProductVariant>(query, values);
    return result.rows[0] || null;
  }

  async reorder(productIds: number[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < productIds.length; i++) {
        await client.query('UPDATE products SET display_order = $1 WHERE id = $2', [i + 1, productIds[i]]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
