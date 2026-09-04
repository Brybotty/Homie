"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const database_1 = require("../config/database");
class CategoryRepository {
    async findAll(onlyActive = true) {
        const query = onlyActive
            ? 'SELECT * FROM categories WHERE is_active = true ORDER BY COALESCE(parent_id, id) ASC, parent_id NULLS FIRST, name ASC'
            : 'SELECT * FROM categories ORDER BY COALESCE(parent_id, id) ASC, parent_id NULLS FIRST, name ASC';
        const result = await database_1.pool.query(query);
        return result.rows;
    }
    async findById(id) {
        const query = 'SELECT * FROM categories WHERE id = $1';
        const result = await database_1.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async findBySlug(slug) {
        const query = 'SELECT * FROM categories WHERE slug = $1';
        const result = await database_1.pool.query(query, [slug]);
        return result.rows[0] || null;
    }
    async create(dto) {
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
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    }
    async update(id, dto) {
        const fields = [];
        const values = [];
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
        const result = await database_1.pool.query(query, values);
        return result.rows[0] || null;
    }
    async softDelete(id) {
        const query = 'UPDATE categories SET is_active = false WHERE id = $1 RETURNING id';
        const result = await database_1.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.CategoryRepository = CategoryRepository;
