import { CategoryRepository } from '../repositories/category.repository';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CategoryService {
  private repo = new CategoryRepository();

  async getAllCategories(onlyActive = true): Promise<Category[]> {
    return this.repo.findAll(onlyActive);
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.repo.findById(id);
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) {
      throw new AppError(`Ya existe una categoría con el slug '${dto.slug}'`, 409);
    }
    return this.repo.create(dto);
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    await this.getCategoryById(id);
    if (dto.slug) {
      const existing = await this.repo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new AppError(`El slug '${dto.slug}' ya está en uso`, 409);
      }
    }
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new AppError('Error al actualizar la categoría', 500);
    }
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.getCategoryById(id);
    const success = await this.repo.softDelete(id);
    if (!success) {
      throw new AppError('No se pudo desactivar la categoría', 500);
    }
  }
}
