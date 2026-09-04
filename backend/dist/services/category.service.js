"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("../repositories/category.repository");
const errorHandler_1 = require("../middleware/errorHandler");
class CategoryService {
    repo = new category_repository_1.CategoryRepository();
    async getAllCategories(onlyActive = true) {
        return this.repo.findAll(onlyActive);
    }
    async getCategoryById(id) {
        const category = await this.repo.findById(id);
        if (!category) {
            throw new errorHandler_1.AppError('Categoría no encontrada', 404);
        }
        return category;
    }
    async createCategory(dto) {
        const existing = await this.repo.findBySlug(dto.slug);
        if (existing) {
            throw new errorHandler_1.AppError(`Ya existe una categoría con el slug '${dto.slug}'`, 409);
        }
        return this.repo.create(dto);
    }
    async updateCategory(id, dto) {
        await this.getCategoryById(id);
        if (dto.slug) {
            const existing = await this.repo.findBySlug(dto.slug);
            if (existing && existing.id !== id) {
                throw new errorHandler_1.AppError(`El slug '${dto.slug}' ya está en uso`, 409);
            }
        }
        const updated = await this.repo.update(id, dto);
        if (!updated) {
            throw new errorHandler_1.AppError('Error al actualizar la categoría', 500);
        }
        return updated;
    }
    async deleteCategory(id) {
        await this.getCategoryById(id);
        const success = await this.repo.softDelete(id);
        if (!success) {
            throw new errorHandler_1.AppError('No se pudo desactivar la categoría', 500);
        }
    }
}
exports.CategoryService = CategoryService;
