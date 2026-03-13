import { Router } from 'express';
import gameController from '../controllers/gameController';

const router = Router();

// Public routes
router.get('/autocomplete', gameController.getAutocompleteSuggestions.bind(gameController));
router.get('/themes', gameController.getAllThemes.bind(gameController));
router.get('/daily', gameController.getDailyGame.bind(gameController));
router.get('/random', gameController.getRandomGame.bind(gameController));
router.get('/', gameController.getAllGames.bind(gameController));
router.get('/:gameId', gameController.getGame.bind(gameController));
router.post('/:gameId/check-answer', gameController.checkAnswer.bind(gameController));

// Admin routes (TODO: Add authentication middleware)
router.post('/', gameController.createGame.bind(gameController));
router.put('/:gameId', gameController.updateGame.bind(gameController));
router.delete('/:gameId', gameController.deleteGame.bind(gameController));

export default router;
