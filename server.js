const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 5000;

let rooms = {};

const newBoard = () => {
  return {
    topLeft: '',
    topMiddle: '',
    topRight: '',
    midLeft: '',
    center: '',
    midRight: '',
    botLeft: '',
    botMiddle: '',
    botRight: '',
  };
};

const calculateBoard = (b, cnt, current) => {
  if (
    (b.topLeft === b.topMiddle &&
      b.topMiddle === b.topRight &&
      b.topLeft !== '') ||
    (b.midLeft === b.center && b.center === b.midRight && b.midLeft !== '') ||
    (b.botLeft === b.botMiddle &&
      b.botMiddle === b.botRight &&
      b.botLeft !== '') ||
    (b.topLeft === b.midLeft && b.midLeft === b.botLeft && b.topLeft !== '') ||
    (b.topMiddle === b.center &&
      b.center === b.botMiddle &&
      b.topMiddle !== '') ||
    (b.topRight === b.midRight &&
      b.midRight === b.botRight &&
      b.topRight !== '') ||
    (b.topLeft === b.center && b.center === b.botRight && b.topLeft !== '') ||
    (b.topRight === b.center && b.center === b.botLeft && b.topRight !== '')
  ) {
    return { status: `${current} Wins` };
  } else if (cnt >= 9) return { status: 'Match Draw' };
  else return { status: 'playing' };
};

io.on('connection', (socket) => {
  console.log('New connection');
  socket.on('join room', ({ id }) => {
    if (!rooms[id]) {
      rooms = { ...rooms, [id]: [socket.id] };
      socket.join(id);
      socket.emit('message', 'Welcome to the game');
      socket.broadcast.to(id).emit('message', 'A player joined');
      io.to(id).emit('playersCount', rooms[id].length);
    } else {
      if (rooms[id].length >= 2) {
        socket.emit('message', 'Lobby full');
      } else {
        rooms[id].unshift(socket.id);
        socket.join(id);
        socket.emit('message', 'Welcome to the game');
        socket.broadcast.to(id).emit('message', 'A player joined');
        io.to(id).emit('playersCount', rooms[id].length);
      }
    }

    socket.on('start', () => {
      if (rooms[id].length == 2) {
        rooms[id + 'board'] = newBoard();
        rooms[id + 'count'] = 0;
        if (rooms[id + 'current'] == null) rooms[id + 'current'] = rooms[id][0];
        io.to(id).emit('set current move', rooms[id + 'current']);
      }
    });

    socket.on('reset game', () => {
      if (rooms[id].length == 2) {
        rooms[id + 'board'] = newBoard();
        rooms[id + 'count'] = 0;
        rooms[id + 'current'] = rooms[id][0];
        io.to(id).emit('game board', {
          gameState: rooms[id + 'board'],
          current: rooms[id + 'current'],
        });
        io.to(id).emit('message', '');
      }
    });

    socket.on('made move', ({ tile_name }) => {
      if (rooms[id].length == 2) {
        if (rooms[id + 'current'] == rooms[id][0])
          rooms[id + 'current'] = rooms[id][1];
        else if (rooms[id + 'current'] == rooms[id][1])
          rooms[id + 'current'] = rooms[id][0];
        if (socket.id === rooms[id][0]) {
          rooms[id + 'board'] = { ...rooms[id + 'board'], [tile_name]: 'X' };
        } else if (socket.id === rooms[id][1]) {
          rooms[id + 'board'] = { ...rooms[id + 'board'], [tile_name]: 'O' };
        }
        rooms[id + 'count'] += 1;
        var res = calculateBoard(
          rooms[id + 'board'],
          rooms[id + 'count'],
          rooms[id + 'current'] === rooms[id][0] ? 'O' : 'X' //Reversing because move is already changed above
        );
        io.to(id).emit('message', '');
        if (res.status !== 'playing') {
          io.to(id).emit('message', res.status);
        }
        io.to(id).emit('game board', {
          gameState: rooms[id + 'board'],
          current: rooms[id + 'current'],
        });
      }
    });
  });
  socket.on('disconnect', () => {
    Object.keys(rooms).map((key) => {
      if (
        key.indexOf('board') === -1 &&
        key.indexOf('current') === -1 &&
        key.indexOf('count') === -1
      ) {
        rooms[key] = rooms[key].filter((id) => id !== socket.id);
      }
    });
    console.log('User left');
  });
});

server.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
