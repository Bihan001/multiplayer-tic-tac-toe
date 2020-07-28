import React, { Fragment, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const Home = ({ history }) => {
  var code = useRef();

  const createRoom = (e) => {
    const gameCode = uuidv4();
    history.push(`/${gameCode}`);
  };
  const joinGame = (e) => {
    if (code.current.value) {
      history.push(`/${code.current.value}`);
    }
  };
  return (
    <Fragment>
      <div className='roomContainer d-flex justify-content-center'>
        <div className='room'>
          <div className='display-5'>Tic Tac Toe</div>
          <br />
          <button
            type='button'
            className='btn btn-secondary'
            onClick={(e) => createRoom()}
          >
            Create Game
          </button>
          <br />
          <input
            ref={code}
            onChange={(e) => (code.current.value = e.target.value)}
            type='text'
            placeholder='Game Code'
            className='form-control'
          />
          <br />
          <button
            type='button'
            className='btn btn-secondary'
            onClick={(e) => joinGame(e)}
          >
            Join Game
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
