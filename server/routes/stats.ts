import { Router } from 'express';
import statsController from '../controllers/statsController';

const router = Router();

router.get('/system/overview', statsController.getSystemStats.bind(statsController));
router.get('/leaderboard', statsController.getLeaderboard.bind(statsController));
router.get('/:userId', statsController.getUserStats.bind(statsController));
router.get('/:userId/detailed', statsController.getDetailedStats.bind(statsController));
router.get('/:userId/rank', statsController.getUserRank.bind(statsController));
router.post('/record-question', statsController.recordQuestion.bind(statsController));
router.post('/complete-game', statsController.completeGame.bind(statsController));

export default router;
