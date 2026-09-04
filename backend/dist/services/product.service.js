"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("../repositories/product.repository");
const errorHandler_1 = require("../middleware/errorHandler");
class ProductService {
    repo = new product_repository_1.ProductRepository();
    async getProducts(options) {
        return this.repo.findAll(options);
    }
    async getProductBySlug(slug) {
        const product = await this.repo.findBySlug(slug);
        if (!product) {
            throw new errorHandler_1.AppError(`Producto no encontrado con el slug '${slug}'`, 404);
        }
        return product;
    }
    async getProductById(id) {
        const product = await this.repo.findById(id);
        if (!product) {
            throw new errorHandler_1.AppError(`Producto no encontrado con ID ${id}`, 404);
        }
        return product;
    }
    async createProduct(dto) {
        const existing = await this.repo.findBySlug(dto.slug);
        if (existing) {
            throw new errorHandler_1.AppError(`Ya existe un producto con el slug '${dto.slug}'`, 409);
        }
        if (!dto.variants || dto.variants.length === 0) {
            throw new errorHandler_1.AppError('El producto debe tener al menos una variante', 400);
        }
        const skus = new Set();
        for (const v of dto.variants) {
            if (skus.has(v.sku)) {
                throw new errorHandler_1.AppError(`SKU duplicado en la solicitud: ${v.sku}`, 400);
            }
            skus.add(v.sku);
        }
        return this.repo.createWithVariants(dto);
    }
    async updateProduct(id, dto) {
        await this.getProductById(id);
        if (dto.slug) {
            const existing = await this.repo.findBySlug(dto.slug);
            if (existing && existing.id !== id) {
                throw new errorHandler_1.AppError(`El slug '${dto.slug}' ya está en uso por otro producto`, 409);
            }
        }
        const updated = await this.repo.updateWithVariants(id, dto);
        if (!updated) {
            throw new errorHandler_1.AppError('Error al actualizar el producto', 500);
        }
        return updated;
    }
    async updateProductBase(id, dto) {
        await this.getProductById(id);
        if (dto.slug) {
            const existing = await this.repo.findBySlug(dto.slug);
            if (existing && existing.id !== id) {
                throw new errorHandler_1.AppError(`El slug '${dto.slug}' ya está en uso por otro producto`, 409);
            }
        }
        const updated = await this.repo.updateBase(id, dto);
        if (!updated) {
            throw new errorHandler_1.AppError('Error al actualizar el producto', 500);
        }
        return updated;
    }
    async updateVariant(variantId, dto) {
        if (dto.stock_quantity !== undefined && dto.stock_quantity < 0) {
            throw new errorHandler_1.AppError('El stock no puede ser negativo', 400);
        }
        if (dto.wholesale_price !== undefined && dto.wholesale_price < 0) {
            throw new errorHandler_1.AppError('El costo mayorista no puede ser negativo', 400);
        }
        if (dto.retail_price !== undefined && dto.retail_price < 0) {
            throw new errorHandler_1.AppError('El precio de venta no puede ser negativo', 400);
        }
        const updated = await this.repo.updateVariant(variantId, dto);
        if (!updated) {
            throw new errorHandler_1.AppError(`Variante no encontrada con ID ${variantId}`, 404);
        }
        return updated;
    }
    async updateVariantStock(variantId, dto) {
        if (dto.stock_quantity < 0) {
            throw new errorHandler_1.AppError('El stock no puede ser negativo', 400);
        }
        const updated = await this.repo.updateVariantStock(variantId, dto.stock_quantity);
        if (!updated) {
            throw new errorHandler_1.AppError(`Variante no encontrada con ID ${variantId}`, 404);
        }
        return updated;
    }
    async reorderProducts(productIds) {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            throw new errorHandler_1.AppError('product_ids debe ser un arreglo de IDs no vacío', 400);
        }
        await this.repo.reorder(productIds);
    }
}
exports.ProductService = ProductService;
