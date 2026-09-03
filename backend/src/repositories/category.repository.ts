import { pool } from '../config/database';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export class CategoryRepository {
  async findAll(onlyActive = true): Promise<Category[]> {
    const query = onlyActive
      ? 'SELECT * FROM categories WHERE is_active = true ORDER BY COALESCE(parent_id, id) ASC, parent_id NULLS FIRST, name ASC'
      : 'SELECT * FROM categories ORDER BY COALESCE(parent_id, id) ASC, parent_id NULLS FIRST, name ASC';
    const result = await pool.query<Category>(query);
    return result.rows;
  }

  async findById(id: number): Promise<Category | null> {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query<Category>(query, [id]);
    return result.rows[0] || null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const query = 'SELECT * FROM categories WHERE slug = $1';
    const result = await pool.query<Category>(query, [slug]);
    return result.rows[0] || null;
  }

  async create(dto: CreateCategoryDto & { parent_id?: number | null }): Promise<Category> {
    const query = `
      INSERT INTO categories (name, slug, description, image_url, parent_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      dto.name,
      dto.slug,
      dto.description || null,
      dto.image_url || null,
      dto.parent_id || null,
      dto.is_active !== undefined ? dto.is_active : true,
    ];
    const result = await pool.query<Category>(query, values);
    return result.rows[0];
  }

  async update(id: number, dto: UpdateCategoryDto & { parent_id?: number | null }): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

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
    if (dto.image_url !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(dto.image_url);
    }
    if (dto.parent_id !== undefined) {
      fields.push(`parent_id = $${idx++}`);
      values.push(dto.parent_id);
    }
    if (dto.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(dto.is_active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const result = await pool.query<Category>(query, values);
    return result.rows[0] || null;
  }

  async softDelete(id: number): Promise<boolean> {
    const query = 'UPDATE categories SET is_active = false WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
