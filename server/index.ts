import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import './config/sqlite'; // Initialize SQLite database
import gameRoutes from './routes/games';
import statsRoutes from './routes/stats';
import adminRoutes from './routes/admin';

dotenv.config();

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const VERSION = packageJson.version;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (audio uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/games', gameRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// Version endpoint
app.get('/api/version', (req, res) => {
  res.json({ version: VERSION });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    version: VERSION,
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server (SQLite is already initialized)
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: SQLite (music-trivia.db)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
