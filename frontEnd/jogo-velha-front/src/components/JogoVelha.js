import React, { useState, useEffect, useContext } from 'react';
import { io } from "socket.io-client";
import { gameLoaded, GameContext, leaveRoom } from '../contexts/GameContext';
import '../style/JogoDaVelha.css';


// Conexão com o servidor Socket.IO
const socket = io("http://localhost:4000");

const JogoVelha = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState("-");
  const [currentPlayer, setCurrentPlayer] = useState("-");
  const [score, setScore] = useState({ X: 0, O: 0 });

  useEffect(() => {
    gameLoaded();

    // Definir símbolo do jogador ao conectar
    socket.on("assignSymbol", (symbol) => {
      console.log("Símbolo recebido: ", symbol);
      setPlayerSymbol(symbol);
    });

    // Atualizar tabuleiro
    socket.on("updateBoard", ({ board, currentPlayer }) => {
      console.log("Tabuleiro atualizado: ", board);
      setBoard([...board]);
      setCurrentPlayer(currentPlayer);
    });

    // Exibe vencedor ou empate
    socket.on("gameOver", (result) => {
      console.log("Jogo acabou: ", result);
      if (result === "Empate") {
        alert(`O jogo empatou!`);
      } else {
        alert(`Jogador ${result} venceu!`);
      }
    });

    socket.on("updateCurrentPlayer", (currentPlayer) => {
      setCurrentPlayer(currentPlayer);
    });

    // Atualiza o placar
    socket.on("updateScores", (scores) => {
      setScore(scores);
    });

    socket.on("MatchRefresh", (match) => {
      console.log("Recebendo atualiza;'ao do jogo: ", match);
      setBoard([...match.board]);
      setCurrentPlayer(match.currentPlayer);
      setScore(match.score);
    });

    return () => {
      socket.off("assignSymbol");
      socket.off("updateBoard");
      socket.off("gameOver");
      socket.off("updateCurrentPlayer");
      socket.off("updateScores");
    };
  }, []);

  // Jogada do jogador
  const handleMove = (index) => {
    console.log(`Antes de enviar movimento: index=${index}, playerSymbol=${playerSymbol}, currentPlayer=${currentPlayer}`);
    if (!board[index] && currentPlayer === playerSymbol) {
      console.log(`Enviando movimento: index=${index}, symbol=${playerSymbol}`);
      socket.emit("makeMove", { index, symbol: playerSymbol });
    }
  };





  return (
    <div className="game-container">
      <h1>Jogo da Velha</h1>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <GameBoard board={board} onMove={handleMove} />
        <InfoPanel
          playerSymbol={playerSymbol}
          currentPlayer={currentPlayer}
          score={score}
        //restartGame={restartGame}
        />
      </div>

    </div>
  );
}

// Tabuleiro do jogo
function GameBoard({ board, onMove }) {
  return (
    <div className="board">
      {board.map((cell, index) => (
        <div key={index} className="cell" onClick={() => onMove(index)}>
          {cell}
        </div>
      ))}
    </div>
  );
}

// Painel de informações
function InfoPanel({ playerSymbol, currentPlayer, score }) {
  return (
    <div className="info-panel">
      <h2>Placar</h2>
      <p>Vitórias X: {score.X}</p>
      <p>Vitórias O: {score.O}</p>
      <p>Vez de: {currentPlayer}</p>
      <p>Seu símbolo: <span>{playerSymbol}</span></p>

    </div>
  );
}

export default JogoVelha;