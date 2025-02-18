import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import PlayerList from './PlayerList';
import Chat from "./Chat";
 
let socket;
const Game = () => {
    const [players, setPlayers] = useState({});
    const [messages, setMessages] = useState('');

    useEffect(() => {
        socket = io("http://localhost:4000", {
            transports: ["websocket"] // Usa WebSocket para evitar problemas com polling
        });
        
        socket.on("connect", () => {
            console.log("Conectado ao servidor:", socket.id);
        });
    }, []);

    useEffect(() => {
        socket.on('PlayersRefresh', (players) => {
            setPlayers(players);
        });
    }, [players]);
    
        
    useEffect(() => {
        const handleReceiveMessage = (receivedMessage) => {
            setMessages(prevMessages =>  prevMessages +  receivedMessage + '\n\n');
        };
    
        socket.on('ReceiveMessage', handleReceiveMessage);
    
        return () => {
            socket.off('ReceiveMessage', handleReceiveMessage);
        };
    }, []);
    
    

    // Enviar mensagem do Chat para o servidos
    const sendMessage = (message) => { 
        socket.emit('SendMessage', message);
    };

    return (
        <div style = {{display: 'flex', flexDirection:'row'}}>
           <PlayerList players = {players} />
           <Chat sendMessage = {sendMessage} messages={messages} /> 
        </div>
    );
};

export default Game;