import React, { useReducer, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
    transports: ["websocket"], // Usa WebSocket para evitar problemas com polling
    autoConnect: false,
});

const GameContext = React.createContext();

const reducer = (state, action) => {
    switch (action.type){
        case 'CONNECTED':
            return {
                ...state,
                isConnected: action.payload
            };
        case 'PLAYERS':
            return {
                ...state,
                players: action.payload
            };
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload]
            };
        default: 
            return state;
    }
};

const initialState = {
    isConnected: false,
    players: {},
    messages: []
};

const GameProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    
    useEffect(() => {  
        const handleConnect = () => {
            console.log("Conectado!");
            dispatch({ type: 'CONNECTED', payload: true });
        };

        const handleDesconnect = () => {
            console.log("Desconectado!");
            dispatch({ type: 'CONNECTED', payload: false });
        };
    
        const handlePlayersRefresh = (players) => {
            dispatch({ type: 'PLAYERS', payload: players });
        };
    
        const handleReceiveMessage = (receivedMessage) => {
            dispatch({ type: 'ADD_MESSAGE', payload: receivedMessage });
        };
    
        socket.on("connect", handleConnect);
        socket.on("PlayersRefresh", handlePlayersRefresh);
        socket.on("ReceiveMessage", handleReceiveMessage);
        socket.on("deconnect", handleDesconnect);
        
    
        socket.open();
    
        return () => {
            socket.off("connect", handleConnect);
            socket.off("PlayersRefresh", handlePlayersRefresh);
            socket.off("ReceiveMessage", handleReceiveMessage);
        };
    }, []);


    return (
        <GameContext.Provider value={state}>
            {props.children}
        </GameContext.Provider>
    );
};

const sendMessage = (message) => { 
    socket.emit('SendMessage', message);
};

export  { GameContext, GameProvider, sendMessage };
