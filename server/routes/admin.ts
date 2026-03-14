import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import adminController from '../controllers/adminController';

const router = Router();

// Configure multer for database uploads
const uploadDir = path.join(__dirname, '../../uploads/temp');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
} else {
  console.log('✅ Upload directory exists:', uploadDir);
}

const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.db')) {
      cb(null, true);
    } else {
      cb(new Error('Only .db files are allowed'));
    }
  }
});

console.log('📁 Multer upload directory:', uploadDir);

// Admin routes (TODO: Add authentication middleware)
router.get('/stats', adminController.getStats.bind(adminController));
router.get('/decades', adminController.getDecades.bind(adminController));
router.post('/generate', adminController.generateGames.bind(adminController));
router.delete('/games/:theme', adminController.deleteGamesByTheme.bind(adminController));

// Database export/import
router.get('/database/export', adminController.exportDatabase.bind(adminController));
router.post('/database/import', 
  (req, res, next) => {
    upload.single('database')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        console.error('❌ Multer error:', err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large (max 100MB)' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        console.error('❌ Upload error:', err.message);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  adminController.importDatabase.bind(adminController)
);

export default router;
