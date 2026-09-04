"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
const collection_repository_1 = require("../repositories/collection.repository");
const errorHandler_1 = require("../middleware/errorHandler");
class CollectionService {
    collectionRepo;
    constructor() {
        this.collectionRepo = new collection_repository_1.CollectionRepository();
    }
    async getAllCollections(isActive) {
        return this.collectionRepo.findAll({ isActive });
    }
    async getCollectionById(id) {
        const collection = await this.collectionRepo.findById(id);
        if (!collection) {
            throw new errorHandler_1.AppError('Colección no encontrada.', 404);
        }
        return collection;
    }
    async getCollectionBySlug(slug) {
        const collection = await this.collectionRepo.findBySlug(slug);
        if (!collection) {
            throw new errorHandler_1.AppError('Colección no encontrada.', 404);
        }
        return collection;
    }
    async createCollection(dto) {
        if (!dto.name || !dto.name.trim()) {
            throw new errorHandler_1.AppError('El nombre de la colección es obligatorio.', 400);
        }
        if (!dto.slug || !dto.slug.trim()) {
            dto.slug = dto.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        return this.collectionRepo.create(dto);
    }
    async updateCollection(id, dto) {
        return this.collectionRepo.update(id, dto);
    }
    async setCollectionProducts(id, productIds) {
        await this.collectionRepo.setProducts(id, productIds);
        return (await this.collectionRepo.findById(id));
    }
    async deleteCollection(id) {
        const deleted = await this.collectionRepo.delete(id);
        if (!deleted) {
            throw new errorHandler_1.AppError('Colección no encontrada o no pudo eliminarse.', 404);
        }
    }
}
exports.CollectionService = CollectionService;
