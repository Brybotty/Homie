"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const supplier_controller_1 = require("../controllers/supplier.controller");
const validateDto_1 = require("../middleware/validateDto");
const router = (0, express_1.Router)();
const controller = new supplier_controller_1.SupplierController();
router.get('/current', controller.getCurrent);
router.post('/consolidate', (0, validateDto_1.validate)([
    (0, express_validator_1.body)('supplier_name').optional().isString().trim(),
    (0, express_validator_1.body)('notes').optional().isString(),
    (0, express_validator_1.body)('items').optional().isArray(),
    (0, express_validator_1.body)('items.*.variant_id').optional().isInt(),
    (0, express_validator_1.body)('items.*.quantity').optional().isInt({ min: 1 }),
]), controller.consolidate);
exports.default = router;
