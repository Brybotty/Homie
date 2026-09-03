import { SupplierRepository } from '../repositories/supplier.repository';
import { SupplierBatch, SupplierBatchItem } from '../types';
import { AppError } from '../middleware/errorHandler';

export class SupplierService {
  private repo = new SupplierRepository();

  async getCurrentBatch(): Promise<(SupplierBatch & { items: SupplierBatchItem[] }) | null> {
    return this.repo.getCurrentBatch();
  }

  async consolidateBatch(options: {
    supplierName?: string;
    items?: { variant_id: number; quantity: number }[];
    notes?: string;
  }): Promise<SupplierBatch & { items: SupplierBatchItem[] }> {
    // Validar reglas mayoristas de Bogotá
    if (options.items && options.items.length > 0) {
      const totalUnits = options.items.reduce((sum, i) => sum + i.quantity, 0);

      // Verificamos si ya hay un batch acumulado para sumar las unidades
      const current = await this.repo.getCurrentBatch();
      const currentUnits = current ? current.total_units : 0;
      const combinedUnits = currentUnits + totalUnits;

      for (const item of options.items) {
        if (item.quantity < 3) {
          throw new AppError(
            `Regla de proveedor (Bogotá): Cada variante para reposición debe tener al menos 3 unidades. Recibido: ${item.quantity}`,
            400
          );
        }
      }

      if (combinedUnits < 12) {
        throw new AppError(
          `Regla de proveedor (Bogotá): El lote consolidado debe alcanzar un mínimo de 12 unidades en total. Total actual proyectado: ${combinedUnits}`,
          400
        );
      }
    }

    return this.repo.createOrConsolidateBatch(options);
  }
}
