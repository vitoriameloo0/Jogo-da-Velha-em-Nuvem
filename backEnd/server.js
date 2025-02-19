import express from 'express';
import http from 'http';
import { Server } from 'socket.io';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Permite conexões do front-end
        methods: ["GET", "POST"]
    }
});

// 
const game = {
    players: {}, // Armazena os jogadores conectados
    rooms: {},   // Armazena as salas criadas
    match: {},   // Armazena o estado do jogo por sala
};


io.on('connection', (socket) => {
    console.log(`${socket.id} conectado.`);

    // Cria um nome para o jogador e o adiciona ao game.players 
    const name = 'Player_' + socket.id.substr(0, 5);
    game.players[socket.id] = { name };
    sendMessage(game.players[socket.id], 'entrou');
    refreshPlayers();
    refreshRooms();

    // Desconecta o jogador e das salas
    socket.on('disconnect', () => {
        console.log(`${socket.id} desconectou.`)
        sendMessage(game.players[socket.id], 'saiu');
        leaveRoom(socket);
        delete game.players[socket.id];
        refreshPlayers();
        refreshRooms();
    });

    // Envia mensagem para todos os jogadores
    socket.on('SendMessage', (message) => {
        sendMessage(game.players[socket.id], message);
    });

    // Cria uma sala e adiciona o jogador a ela e atribui o símbolo X
    socket.on('CreateRoom', () => {
        socket.join(socket.id);

        game.rooms[socket.id] = {
            name: `Sala do ${game.players[socket.id].name}`,
            player1: socket.id,
            player2: null
        };

        game.players[socket.id] = { room: socket.id, symbol: 'X' };
        console.log(`Atribuindo X para ${socket.id}`);
        socket.emit("assignSymbol", X);
        refreshPlayers();
        refreshRooms();
        sendMessage(game.players[socket.id], 'criou uma sala');
    });

    // Sai da sala
    socket.on('LeaveRoom', () => {
        leaveRoom(socket);
        refreshPlayers();
        refreshRooms();
    });

    // Entra em uma sala e atribui o símbolo O
    socket.on('JoinRoom', (roomId) => {
        if (!game.rooms[roomId] || game.rooms[roomId].player2) return;

        socket.join(roomId);
        game.rooms[roomId].player2 = socket.id;
        game.players[socket.id] = { room: roomId, symbol: 'O' };
        console.log(`Atribuindo O para ${socket.id}`);
        socket.emit("assignSymbol", O);


        refreshPlayers();
        refreshRooms();
        refreshMatch(roomId);
        sendMessage(game.players[socket.id], 'entrou na sala');

    });

    // Inicia o jogo
    socket.on('makeMove', ({ index, symbol }) => {
        // Se o jogador não estiver em uma sala ou não for a vez dele, retorna
        console.log(`Movimento recebido no servidor: index=${index}, symbol=${symbol}`);
        const roomId = game.players[socket.id]?.room;
        const match = game.match[roomId];
        if (!match || match.board[index] !== null || match.currentPlayer !== symbol) return;

        // Atualiza o tabuleiro e troca o jogador
        match.board[index] = symbol;
        match.currentPlayer = symbol === 'X' ? 'O' : 'X';

        // Verifica se houve um vencedor ou empate e atualiza o placar
        const winner = checkWinner(match.board);
        if (winner) {
            match.score[winner]++;
            match.status = 'END';
            io.to(roomId).emit('gameOver', winner);
            resetBoard(match);
        } else if (!match.board.includes(null)) {
            match.status = 'END';
            io.to(roomId).emit('gameOver', 'Empate');
            resetBoard(match);
        }

        console.log("Tabuleiro atualizado: ", match.board);
        refreshMatch(roomId);
    });

});


// Remove o jogador da sala e exclui a sala se não houver jogadores
const leaveRoom = (socket) => {
    const roomId = game.players[socket.id]?.room;
    if (!roomId) return;

    const room = game.rooms[roomId];
    if (!room) return;

    delete game.players[socket.id].room;
    if (room.player1 === socket.id) room.player1 = null;
    else room.player2 = null;

    if (!room.player1 && !room.player2) {
        delete game.rooms[roomId];
        delete game.match[roomId];
    }

    refreshMatch(roomId);
    socket.leave(roomId);
};

// Verifica se houve um vencedor
const checkWinner = (board) => {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of winningCombos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

// Reinicia o jogo
const resetBoard = (match) => {
    match.board = Array(9).fill(null);
    match.currentPlayer = 'X';
    match.status = 'PLAY';
};

// Envia mensagem para todos os jogadores
const sendMessage = (player, message) => {
    io.emit('ReceiveMessage', `${player.name}: ${message}`);
};

// Atualiza a lista de jogadores
const refreshPlayers = () => {
    io.emit('PlayersRefresh', game.players);
};

// Atualiza a lista de salas
const refreshRooms = () => {
    io.emit('RoomsRefresh', game.rooms);
};

// Atualiza o estado do jogo
const refreshMatch = (roomId) => {
    console.log("Enviando atualizando do jogo: ", game.match[roomId]);
    io.to(roomId).emit('MatchRefresh', game.match[roomId]);
};
app.get('/', (req, res) => res.send('Hello World!'));

const port = 4000;
server.listen(port, () => console.log(`Server rodando na porta ${port}!`));