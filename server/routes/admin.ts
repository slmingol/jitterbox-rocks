import { Router } from 'express';
import multer from 'multer';
import adminController from '../controllers/adminController';

const router = Router();

// Configure multer for database uploads
const upload = multer({ 
  dest: 'uploads/temp/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.db')) {
      cb(null, true);
    } else {
      cb(new Error('Only .db files are allowed'));
    }
  }
});

// Admin routes (TODO: Add authentication middleware)
router.get('/stats', adminController.getStats.bind(adminController));
router.get('/decades', adminController.getDecades.bind(adminController));
router.post('/generate', adminController.generateGames.bind(adminController));
router.delete('/games/:theme', adminController.deleteGamesByTheme.bind(adminController));

// Database export/import
router.get('/database/export', adminController.exportDatabase.bind(adminController));
router.post('/database/import', upload.single('database'), adminController.importDatabase.bind(adminController));

export default router;
