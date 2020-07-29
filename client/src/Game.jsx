import React, { Fragment, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

let socket;

const Game = ({ match }) => {
  var gameGrid = useRef();
  const [playerCount, setPlayerCount] = useState(0);
  const [status, setStatus] = useState('');
  const [current, setCurrent] = useState(null);
  const [gameState, setGameState] = useState({
    topLeft: '',
    topMiddle: '',
    topRight: '',
    midLeft: '',
    center: '',
    midRight: '',
    botLeft: '',
    botMiddle: '',
    botRight: '',
  });
  useEffect(() => {
    socket = io('/');
    socket.emit('join room', { id: match.params.room });
    socket.on('message', (msg) => {
      setStatus(msg);
    });
    socket.emit('start', {});
    socket.on('set current move', (current) => setCurrent(current));
    socket.on('game board', ({ gameState, current }) => {
      setGameState(gameState);
      setCurrent(current);
    });
    socket.on('playersCount', (cnt) => setPlayerCount(cnt));
  }, []);

  const resetGame = (e) => {
    socket.emit('reset game', 'reset my game');
  };

  const cellClicked = (e) => {
    console.log(socket.id);
    if (current == socket.id) {
      if (gameState[e.target.classList[1]]) return console.log('move made');
      socket.emit('made move', { tile_name: e.target.classList[1] });
    } else {
      setStatus('Wait for your move');
    }
  };

  useEffect(() => {
    if (status.indexOf('Win') !== -1 || status.indexOf('Draw') !== -1) {
      gameGrid.current.classList.add('disabled');
    } else if (gameGrid.current.classList.contains('disabled')) {
      gameGrid.current.classList.remove('disabled');
    }
  }, [status]);

  return (
    gameState && (
      <Fragment>
        <div className='game'>
          <div className='display-5 text-center mt-3'>TIC TAC TOE</div>
          <div className='d-flex justify-content-around my-3 align-items-center'>
            <p className='players mt-3'>Players: {playerCount}</p>
            <p className='status mt-3'>{status}</p>
            <button onClick={(e) => resetGame(e)} className='btn btn-secondary'>
              Reset
            </button>
          </div>
          <div ref={gameGrid} className='gameGrid'>
            <div onClick={(e) => cellClicked(e)} className='gameCell topLeft'>
              {gameState.topLeft}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell topMiddle'>
              {gameState.topMiddle}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell topRight'>
              {gameState.topRight}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell midLeft'>
              {gameState.midLeft}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell center'>
              {gameState.center}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell midRight'>
              {gameState.midRight}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell botLeft'>
              {gameState.botLeft}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell botMiddle'>
              {gameState.botMiddle}
            </div>
            <div onClick={(e) => cellClicked(e)} className='gameCell botRight'>
              {gameState.botRight}
            </div>
          </div>
        </div>
      </Fragment>
    )
  );
};

export default Game;
