"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
class ProductController {
    service = new product_service_1.ProductService();
    getAll = async (req, res, next) => {
        try {
            const categorySlug = req.query.category;
            const collectionSlug = req.query.collection;
            const isActive = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
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
        }
        catch (err) {
            next(err);
        }
    };
    getBySlug = async (req, res, next) => {
        try {
            const slug = req.params.slug;
            const product = await this.service.getProductBySlug(slug);
            res.json({ success: true, data: product });
        }
        catch (err) {
            next(err);
        }
    };
    create = async (req, res, next) => {
        try {
            const product = await this.service.createProduct(req.body);
            res.status(201).json({
                success: true,
                data: product,
                message: 'Producto y variantes creados exitosamente',
            });
        }
        catch (err) {
            next(err);
        }
    };
    update = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const product = await this.service.updateProduct(id, req.body);
            res.json({
                success: true,
                data: product,
                message: 'Producto y variantes actualizados exitosamente',
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateBase = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const product = await this.service.updateProductBase(id, req.body);
            res.json({
                success: true,
                data: product,
                message: 'Información base del producto actualizada',
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateVariant = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const variant = await this.service.updateVariant(id, req.body);
            res.json({
                success: true,
                data: variant,
                message: 'Variante actualizada correctamente',
            });
        }
        catch (err) {
            next(err);
        }
    };
    updateStock = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const variant = await this.service.updateVariantStock(id, req.body);
            res.json({
                success: true,
                data: variant,
                message: 'Stock de variante actualizado correctamente',
            });
        }
        catch (err) {
            next(err);
        }
    };
    reorder = async (req, res, next) => {
        try {
            const productIds = req.body.product_ids;
            await this.service.reorderProducts(productIds);
            res.json({
                success: true,
                data: null,
                message: 'Orden de productos actualizado correctamente',
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.ProductController = ProductController;
