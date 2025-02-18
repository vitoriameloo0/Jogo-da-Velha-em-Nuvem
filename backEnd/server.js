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


const game = {
    players: {}
};

io.on('connection', (socket) => {
    console.log(`${socket.id} conectado.`);

    const name = 'Player_' + socket.id.substr(0,5);
    game.players[socket.id] = {name};
    refreshPlayers();

    socket.on('disconnect', () => {
       delete game.players[socket.id];
       refreshPlayers();
    });

});

const refreshPlayers = () => {
    socket.broadcast.emit('PlayerRefresh', game.players);
}


app.get('/', (req, res) => res.send('Hello World!'));

const port = 4000;
server.listen(port, () => console.log(`Server rodando na porta ${port}!`));