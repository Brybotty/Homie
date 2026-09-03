import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse, PaginatedResponse, ProductWithVariants, Product, ProductVariant } from '../types';

export class ProductController {
  private service = new ProductService();

  getAll = async (
    req: Request,
    res: Response<PaginatedResponse<ProductWithVariants>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categorySlug = req.query.category as string | undefined;
      const collectionSlug = req.query.collection as string | undefined;
      const isActive = req.query.active !== undefined ? req.query.active === 'true' : undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const { products, total } = await this.service.getProducts({
        categorySlug,
        collectionSlug,
        isActive,
        page,
        limit,
      });

      res.json({
        success: true,
        data: products,
        total,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  };

  getBySlug = async (
    req: Request,
    res: Response<ApiResponse<ProductWithVariants>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const slug = req.params.slug;
      const product = await this.service.getProductBySlug(slug);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request,
    res: Response<ApiResponse<ProductWithVariants>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const product = await this.service.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product,
        message: 'Producto y variantes creados exitosamente',
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request,
    res: Response<ApiResponse<ProductWithVariants>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await this.service.updateProduct(id, req.body);
      res.json({
        success: true,
        data: product,
        message: 'Producto y variantes actualizados exitosamente',
      });
    } catch (err) {
      next(err);
    }
  };

  updateBase = async (
    req: Request,
    res: Response<ApiResponse<Product>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await this.service.updateProductBase(id, req.body);
      res.json({
        success: true,
        data: product,
        message: 'Información base del producto actualizada',
      });
    } catch (err) {
      next(err);
    }
  };

  updateVariant = async (
    req: Request,
    res: Response<ApiResponse<ProductVariant>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const variant = await this.service.updateVariant(id, req.body);
      res.json({
        success: true,
        data: variant,
        message: 'Variante actualizada correctamente',
      });
    } catch (err) {
      next(err);
    }
  };

  updateStock = async (
    req: Request,
    res: Response<ApiResponse<ProductVariant>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const variant = await this.service.updateVariantStock(id, req.body);
      res.json({
        success: true,
        data: variant,
        message: 'Stock de variante actualizado correctamente',
      });
    } catch (err) {
      next(err);
    }
  };

  reorder = async (
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productIds: number[] = req.body.product_ids;
      await this.service.reorderProducts(productIds);
      res.json({
        success: true,
        data: null,
        message: 'Orden de productos actualizado correctamente',
      });
    } catch (err) {
      next(err);
    }
  };
}
