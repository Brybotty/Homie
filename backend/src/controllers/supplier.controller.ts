import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/supplier.service';
import { ApiResponse } from '../types';

export class SupplierController {
  private service = new SupplierService();

  getCurrent = async (_req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
    try {
      const batch = await this.service.getCurrentBatch();
      res.json({ success: true, data: batch });
    } catch (err) {
      next(err);
    }
  };

  consolidate = async (req: Request, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
    try {
      const batch = await this.service.consolidateBatch(req.body);
      res.status(201).json({
        success: true,
        data: batch,
        message: 'Lote consolidado exitosamente',
      });
    } catch (err) {
      next(err);
    }
  };
}
