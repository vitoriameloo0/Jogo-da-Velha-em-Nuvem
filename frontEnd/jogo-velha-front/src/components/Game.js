import React, { useContext } from "react";
import PlayerList from './PlayerList';
import Chat from "./Chat";
import { GameContext, sendMessage } from '../contexts/GameContext';
import Rooms from "./Rooms";
import JogoVelha from "./JogoVelha";

const Game = () => {
    const { isConnected, players, messages, match } = useContext(GameContext);
    console.log(match);

    return (
        <>
            {!isConnected &&
                <div>Conectando...</div>
            }

            {match.status && <JogoVelha />}

            {!match.status &&
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className='list-container'>
                        <Rooms />
                        <PlayerList players={players} />
                    </div>
                    <Chat sendMessage={sendMessage} messages={messages} />
                </div>
            }
        </>
    );
};

export default Game;