import { Router } from 'express';
import adminController from '../controllers/adminController';

const router = Router();

// Admin routes (TODO: Add authentication middleware)
router.get('/stats', adminController.getStats.bind(adminController));
router.get('/decades', adminController.getDecades.bind(adminController));
router.post('/generate', adminController.generateGames.bind(adminController));
router.delete('/games/:theme', adminController.deleteGamesByTheme.bind(adminController));

export default router;
