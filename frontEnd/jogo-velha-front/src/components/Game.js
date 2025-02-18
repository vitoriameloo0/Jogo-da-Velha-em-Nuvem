import React, { useContext } from "react";
import PlayerList from './PlayerList';
import Chat from "./Chat";
import { GameContext, sendMessage} from "../contexts/GameContext";

const Game = () => {
    const { isConnected , players, messages} = useContext(GameContext);

    return (
        <>
            {!isConnected && 
                <div>Conectando...</div>
            }

            <div style = {{display: 'flex', flexDirection:'row'}}>
                <PlayerList players = {players} />
                <Chat sendMessage = {sendMessage} messages={messages} /> 
            </div>
        </>
    );
};

export default Game;