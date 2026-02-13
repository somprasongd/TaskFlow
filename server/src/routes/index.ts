import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import statsRoutes from './stats.routes';
import taskRoutes from './task.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/tasks', taskRoutes);
router.use('/stats', statsRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API is running' });
});

export default router;
