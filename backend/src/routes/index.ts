import { Router } from 'express';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import supplierRoutes from './supplier.routes';
import authRoutes from './auth.routes';
import collectionRoutes from './collection.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/collections', collectionRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/batches', supplierRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default router;
