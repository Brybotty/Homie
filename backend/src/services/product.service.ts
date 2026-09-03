import { ProductRepository } from '../repositories/product.repository';
import {
  Product,
  ProductVariant,
  ProductWithVariants,
  CreateProductDto,
  UpdateProductDto,
  UpdateVariantStockDto,
} from '../types';
import { AppError } from '../middleware/errorHandler';

export class ProductService {
  private repo = new ProductRepository();

  async getProducts(options: {
    categorySlug?: string;
    collectionSlug?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: ProductWithVariants[]; total: number }> {
    return this.repo.findAll(options);
  }

  async getProductBySlug(slug: string): Promise<ProductWithVariants> {
    const product = await this.repo.findBySlug(slug);
    if (!product) {
      throw new AppError(`Producto no encontrado con el slug '${slug}'`, 404);
    }
    return product;
  }

  async getProductById(id: number): Promise<ProductWithVariants> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new AppError(`Producto no encontrado con ID ${id}`, 404);
    }
    return product;
  }

  async createProduct(dto: CreateProductDto): Promise<ProductWithVariants> {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) {
      throw new AppError(`Ya existe un producto con el slug '${dto.slug}'`, 409);
    }

    if (!dto.variants || dto.variants.length === 0) {
      throw new AppError('El producto debe tener al menos una variante', 400);
    }

    const skus = new Set<string>();
    for (const v of dto.variants) {
      if (skus.has(v.sku)) {
        throw new AppError(`SKU duplicado en la solicitud: ${v.sku}`, 400);
      }
      skus.add(v.sku);
    }

    return this.repo.createWithVariants(dto);
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<ProductWithVariants> {
    await this.getProductById(id);
    if (dto.slug) {
      const existing = await this.repo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new AppError(`El slug '${dto.slug}' ya está en uso por otro producto`, 409);
      }
    }

    const updated = await this.repo.updateWithVariants(id, dto);
    if (!updated) {
      throw new AppError('Error al actualizar el producto', 500);
    }
    return updated;
  }

  async updateProductBase(id: number, dto: UpdateProductDto): Promise<Product> {
    await this.getProductById(id);
    if (dto.slug) {
      const existing = await this.repo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new AppError(`El slug '${dto.slug}' ya está en uso por otro producto`, 409);
      }
    }
    const updated = await this.repo.updateBase(id, dto);
    if (!updated) {
      throw new AppError('Error al actualizar el producto', 500);
    }
    return updated;
  }

  async updateVariant(variantId: number, dto: Partial<ProductVariant>): Promise<ProductVariant> {
    if (dto.stock_quantity !== undefined && dto.stock_quantity < 0) {
      throw new AppError('El stock no puede ser negativo', 400);
    }
    if (dto.wholesale_price !== undefined && dto.wholesale_price < 0) {
      throw new AppError('El costo mayorista no puede ser negativo', 400);
    }
    if (dto.retail_price !== undefined && dto.retail_price < 0) {
      throw new AppError('El precio de venta no puede ser negativo', 400);
    }

    const updated = await this.repo.updateVariant(variantId, dto);
    if (!updated) {
      throw new AppError(`Variante no encontrada con ID ${variantId}`, 404);
    }
    return updated;
  }

  async updateVariantStock(variantId: number, dto: UpdateVariantStockDto): Promise<ProductVariant> {
    if (dto.stock_quantity < 0) {
      throw new AppError('El stock no puede ser negativo', 400);
    }
    const updated = await this.repo.updateVariantStock(variantId, dto.stock_quantity);
    if (!updated) {
      throw new AppError(`Variante no encontrada con ID ${variantId}`, 404);
    }
    return updated;
  }

  async reorderProducts(productIds: number[]): Promise<void> {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new AppError('product_ids debe ser un arreglo de IDs no vacío', 400);
    }
    await this.repo.reorder(productIds);
  }
}
