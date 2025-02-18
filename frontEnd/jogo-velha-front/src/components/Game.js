import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const Game = () => {
    const [players, setPlayers] = useState({});

    useEffect(() => {
        const socket = io("http://localhost:4000", {
            transports: ["websocket"] // Usa WebSocket para evitar problemas com polling
        });
        
        socket.on("connect", () => {
            console.log("Conectado ao servidor:", socket.id);
        });

        socket.on('PlayerRefresh', (players) => {
            setPlayers(players);
        });
    }, []);

    return (
        <div>
            {Object.keys(players)
                .map((key) => (
                    <div>{players[key].name}</div> 
                    ))
            }
        </div>
    );
};

export default Game;