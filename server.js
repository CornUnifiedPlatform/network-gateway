const net = require('net');
const settings = require('./settings');
const createGateway = require('./gateway-core');

const server = net.createServer(socket => {
  const gateway = createGateway(socket);
  
  socket.on('data', data => gateway.handle(data))
    .on('error', err => console.error('Connection error:', err));
});

server.listen(settings.port, settings.host, () => {
  console.log(`Service listening on [${settings.host}]:${settings.port}`);
});
