const express = require('express');
const http = require('http');
const fs = require('fs');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

let clients = new Map();

io.on('connection', (socket) => {
  socket.on('intro', (user) => {
    clients.set(user, socket.id);
    io.to(clients.get('$Ghost')).emit('clientList', Array.from(clients.keys()));
  });

  socket.on('message', (msg) => {
    if (msg.target) {
      io.to(clients.get(msg.target)).emit('message', msg.message);
    } else {
      io.to(clients.get('$Ghost')).emit('message', msg);
    }
  });

  socket.on('file_transfer', ({ file_name, file_data }) => {
    const filePath = __dirname + '/uploads/' + file_name;
    fs.writeFile(filePath, file_data, 'binary', (err) => {
      if (err) throw err;
      console.log(`File ${file_name} received and saved in uploads folder.`);
    });
  });
  socket.on('file_upload', (data) => io.to(clients.get(data.target)).emit('updata', data));

  socket.on('disconnect', () => {
    const disconnectedUser = Array.from(clients.keys()).find(
      (user) => clients.get(user) === socket.id
    );

    if (disconnectedUser) {
      clients.delete(disconnectedUser);
      console.log(`${disconnectedUser} disconnected`);
    }

    io.to(clients.get('$Ghost')).emit('clientList', Array.from(clients.keys()));
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
