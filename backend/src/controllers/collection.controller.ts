import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../services/collection.service';
import { ApiResponse } from '../types';

export class CollectionController {
  private collectionService: CollectionService;

  constructor() {
    this.collectionService = new CollectionService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activeOnly = req.query.active !== undefined ? req.query.active === 'true' : undefined;
      const collections = await this.collectionService.getAllCollections(activeOnly);
      const response: ApiResponse<typeof collections> = {
        success: true,
        data: collections,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const collection = await this.collectionService.getCollectionById(id);
      const response: ApiResponse<typeof collection> = {
        success: true,
        data: collection,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug;
      const collection = await this.collectionService.getCollectionBySlug(slug);
      const response: ApiResponse<typeof collection> = {
        success: true,
        data: collection,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collection = await this.collectionService.createCollection(req.body);
      const response: ApiResponse<typeof collection> = {
        success: true,
        data: collection,
        message: 'Colección creada con éxito.',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const collection = await this.collectionService.updateCollection(id, req.body);
      const response: ApiResponse<typeof collection> = {
        success: true,
        data: collection,
        message: 'Colección actualizada con éxito.',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  setProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const productIds: number[] = req.body.product_ids || [];
      const collection = await this.collectionService.setCollectionProducts(id, productIds);
      const response: ApiResponse<typeof collection> = {
        success: true,
        data: collection,
        message: 'Productos de la colección actualizados con éxito.',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.collectionService.deleteCollection(id);
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'Colección eliminada con éxito.',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
