const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize socket.io on the HTTP server
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
