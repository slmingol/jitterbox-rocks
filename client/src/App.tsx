import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import VersionDisplay from './components/VersionDisplay';
import Home from './pages/Home';
import DailyGame from './pages/DailyGame';
import PracticeMode from './pages/PracticeMode';
import GamePlay from './pages/GamePlay';
import Statistics from './pages/Statistics';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/daily" element={<DailyGame />} />
                <Route path="/practice" element={<PracticeMode />} />
                <Route path="/game/:gameId" element={<GamePlay />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <VersionDisplay />
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
