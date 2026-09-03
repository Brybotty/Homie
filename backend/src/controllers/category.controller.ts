import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { ApiResponse } from '../types';

export class CategoryController {
  private service = new CategoryService();

  getAll = async (req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
    try {
      const onlyActive = req.query.active !== 'false';
      const categories = await this.service.getAllCategories(onlyActive);
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await this.service.getCategoryById(id);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.createCategory(req.body);
      res.status(201).json({ success: true, data: category, message: 'Categoría creada con éxito' });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await this.service.updateCategory(id, req.body);
      res.json({ success: true, data: category, message: 'Categoría actualizada con éxito' });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.deleteCategory(id);
      res.json({ success: true, data: { id }, message: 'Categoría desactivada con éxito' });
    } catch (err) {
      next(err);
    }
  };
}
