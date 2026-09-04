"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const supplier_repository_1 = require("../repositories/supplier.repository");
const errorHandler_1 = require("../middleware/errorHandler");
class SupplierService {
    repo = new supplier_repository_1.SupplierRepository();
    async getCurrentBatch() {
        return this.repo.getCurrentBatch();
    }
    async consolidateBatch(options) {
        // Validar reglas mayoristas de Bogotá
        if (options.items && options.items.length > 0) {
            const totalUnits = options.items.reduce((sum, i) => sum + i.quantity, 0);
            // Verificamos si ya hay un batch acumulado para sumar las unidades
            const current = await this.repo.getCurrentBatch();
            const currentUnits = current ? current.total_units : 0;
            const combinedUnits = currentUnits + totalUnits;
            for (const item of options.items) {
                if (item.quantity < 3) {
                    throw new errorHandler_1.AppError(`Regla de proveedor (Bogotá): Cada variante para reposición debe tener al menos 3 unidades. Recibido: ${item.quantity}`, 400);
                }
            }
            if (combinedUnits < 12) {
                throw new errorHandler_1.AppError(`Regla de proveedor (Bogotá): El lote consolidado debe alcanzar un mínimo de 12 unidades en total. Total actual proyectado: ${combinedUnits}`, 400);
            }
        }
        return this.repo.createOrConsolidateBatch(options);
    }
}
exports.SupplierService = SupplierService;
