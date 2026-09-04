"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionController = void 0;
const collection_service_1 = require("../services/collection.service");
class CollectionController {
    collectionService;
    constructor() {
        this.collectionService = new collection_service_1.CollectionService();
    }
    getAll = async (req, res, next) => {
        try {
            const activeOnly = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const collections = await this.collectionService.getAllCollections(activeOnly);
            const response = {
                success: true,
                data: collections,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const collection = await this.collectionService.getCollectionById(id);
            const response = {
                success: true,
                data: collection,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    };
    getBySlug = async (req, res, next) => {
        try {
            const slug = req.params.slug;
            const collection = await this.collectionService.getCollectionBySlug(slug);
            const response = {
                success: true,
                data: collection,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    };
    create = async (req, res, next) => {
        try {
            const collection = await this.collectionService.createCollection(req.body);
            const response = {
                success: true,
                data: collection,
                message: 'Colección creada con éxito.',
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const collection = await this.collectionService.updateCollection(id, req.body);
            const response = {
                success: true,
                data: collection,
                message: 'Colección actualizada con éxito.',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    };
    setProducts = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const productIds = req.body.product_ids || [];
            const collection = await this.collectionService.setCollectionProducts(id, productIds);
            const response = {
                success: true,
                data: collection,
                message: 'Productos de la colección actualizados con éxito.',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            await this.collectionService.deleteCollection(id);
            const response = {
                success: true,
                data: null,
                message: 'Colección eliminada con éxito.',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CollectionController = CollectionController;
