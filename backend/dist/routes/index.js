"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_routes_1 = __importDefault(require("./category.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const supplier_routes_1 = __importDefault(require("./supplier.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const collection_routes_1 = __importDefault(require("./collection.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/categories', category_routes_1.default);
router.use('/collections', collection_routes_1.default);
router.use('/products', product_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/batches', supplier_routes_1.default);
router.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
exports.default = router;
