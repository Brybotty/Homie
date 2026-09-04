"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const supplier_service_1 = require("../services/supplier.service");
class SupplierController {
    service = new supplier_service_1.SupplierService();
    getCurrent = async (_req, res, next) => {
        try {
            const batch = await this.service.getCurrentBatch();
            res.json({ success: true, data: batch });
        }
        catch (err) {
            next(err);
        }
    };
    consolidate = async (req, res, next) => {
        try {
            const batch = await this.service.consolidateBatch(req.body);
            res.status(201).json({
                success: true,
                data: batch,
                message: 'Lote consolidado exitosamente',
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.SupplierController = SupplierController;
