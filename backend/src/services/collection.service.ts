import { CollectionRepository } from '../repositories/collection.repository';
import { Collection, CreateCollectionDto, UpdateCollectionDto } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CollectionService {
  private collectionRepo: CollectionRepository;

  constructor() {
    this.collectionRepo = new CollectionRepository();
  }

  async getAllCollections(isActive?: boolean): Promise<Collection[]> {
    return this.collectionRepo.findAll({ isActive });
  }

  async getCollectionById(id: number): Promise<Collection> {
    const collection = await this.collectionRepo.findById(id);
    if (!collection) {
      throw new AppError('Colección no encontrada.', 404);
    }
    return collection;
  }

  async getCollectionBySlug(slug: string): Promise<Collection> {
    const collection = await this.collectionRepo.findBySlug(slug);
    if (!collection) {
      throw new AppError('Colección no encontrada.', 404);
    }
    return collection;
  }

  async createCollection(dto: CreateCollectionDto): Promise<Collection> {
    if (!dto.name || !dto.name.trim()) {
      throw new AppError('El nombre de la colección es obligatorio.', 400);
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

  async updateCollection(id: number, dto: UpdateCollectionDto): Promise<Collection> {
    return this.collectionRepo.update(id, dto);
  }

  async setCollectionProducts(id: number, productIds: number[]): Promise<Collection> {
    await this.collectionRepo.setProducts(id, productIds);
    return (await this.collectionRepo.findById(id))!;
  }

  async deleteCollection(id: number): Promise<void> {
    const deleted = await this.collectionRepo.delete(id);
    if (!deleted) {
      throw new AppError('Colección no encontrada o no pudo eliminarse.', 404);
    }
  }
}
