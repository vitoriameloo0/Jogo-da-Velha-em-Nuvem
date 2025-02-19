import React from 'react';

const PLayerList = (props) => {

    return (
        <div className='list-group'>
            <span className='list-title'>JOGADORES</span>

            {Object.keys(props.players)
                .map((key) => (
                    <div key={key} className='list-item'>{props.players[key].name}</div>
                ))
            }
        </div>
    );
};

export default PLayerList;