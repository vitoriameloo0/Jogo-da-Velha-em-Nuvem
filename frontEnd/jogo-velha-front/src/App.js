import React from 'react';
import './App.css';
import Game from './components/Game';
import { GameProvider } from './contexts/GameContext';

function App() {
  return (
    <div className="main-container">
      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
}

export default App;
