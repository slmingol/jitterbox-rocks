import axios from 'axios';
import { Game, UserStats, DetailedUserStats } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameApi = {
  getDailyGame: async (date?: Date): Promise<Game> => {
    const params = date ? { date: date.toISOString() } : {};
    const response = await api.get('/games/daily', { params });
    return response.data;
  },

  getGame: async (gameId: string): Promise<Game> => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  getAllGames: async (limit?: number, theme?: string): Promise<Game[]> => {
    const params: any = {};
    if (limit) params.limit = limit;
    if (theme && theme !== 'all') params.theme = theme;
    const response = await api.get('/games', { params });
    return response.data;
  },

  getAllThemes: async (): Promise<string[]> => {
    const response = await api.get('/games/themes');
    return response.data;
  },

  getRandomGame: async (): Promise<Game> => {
    const response = await api.get('/games/random');
    return response.data;
  },

  createGame: async (gameData: {
    title: string;
    description: string;
    questions: any[];
    isDaily: boolean;
    date?: Date;
  }): Promise<Game> => {
    const response = await api.post('/games', gameData);
    return response.data;
  },

  updateGame: async (gameId: string, updates: any): Promise<Game> => {
    const response = await api.put(`/games/${gameId}`, updates);
    return response.data;
  },

  deleteGame: async (gameId: string): Promise<void> => {
    await api.delete(`/games/${gameId}`);
  },
};

export const statsApi = {
  getUserStats: async (userId: string, username: string): Promise<UserStats> => {
    const response = await api.get(`/stats/${userId}`, {
      params: { username },
    });
    return response.data;
  },

  getDetailedStats: async (userId: string): Promise<DetailedUserStats> => {
    const response = await api.get(`/stats/${userId}/detailed`);
    return response.data;
  },

  recordQuestion: async (data: {
    userId: string;
    username: string;
    gameId: string;
    questionIndex: number;
    userAnswer: string;
    timeSpent: number;
  }): Promise<{
    isCorrect: boolean;
    correctAnswer: string;
    points: number;
  }> => {
    const response = await api.post('/stats/record-question', data);
    return response.data;
  },

  completeGame: async (data: {
    userId: string;
    username: string;
    gameId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number;
  }): Promise<DetailedUserStats> => {
    const response = await api.post('/stats/complete-game', data);
    return response.data;
  },

  getLeaderboard: async (limit?: number): Promise<UserStats[]> => {
    const params = limit ? { limit } : {};
    const response = await api.get('/stats/leaderboard', { params });
    return response.data;
  },

  getUserRank: async (userId: string): Promise<{ rank: number }> => {
    const response = await api.get(`/stats/${userId}/rank`);
    return response.data;
  },
};

export default api;
