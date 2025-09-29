const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const searchCounts = {};
const clientTerms = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('searchTerm', (term) => {
    const previousTerm = clientTerms[socket.id];
    if (previousTerm && previousTerm !== term) {
      if (searchCounts[previousTerm]) {
        searchCounts[previousTerm]--;
        if (searchCounts[previousTerm] < 0) searchCounts[previousTerm] = 0;
        io.emit('updateCount', { term: previousTerm, count: searchCounts[previousTerm] });
      }
    }

    clientTerms[socket.id] = term;

    if (!searchCounts[term]) {
      searchCounts[term] = 0;
    }
    searchCounts[term]++;

    io.emit('updateCount', { term, count: searchCounts[term] });
  });

  socket.on('disconnect', () => {
    const term = clientTerms[socket.id];
    if (term && searchCounts[term]) {
      searchCounts[term]--;
      if (searchCounts[term] < 0) searchCounts[term] = 0;
      io.emit('updateCount', { term, count: searchCounts[term] });
    }
    delete clientTerms[socket.id];
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
