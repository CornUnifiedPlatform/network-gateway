const net = require('net');
const dns = require('dns');
const { assert } = require('console');
const uuid = require('uuid');
const { 
  NETWORK_VERSION, STATE, AUTH_METHODS,
  COMMAND_TYPES, ADDR_TYPES, RESPONSE_CODES
} = require('./config-options');
const utils = require('./utils');

function createGateway(socket) {
  const session = {
    id: uuid.v4(),
    buffer: Buffer.alloc(0),
    offset: 0,
    state: STATE.HANDSHAKE
  };

  function parseAuthMethods() {
    const buf = session.buffer;
    let offset = session.offset;
    
    const version = buf[offset++];
    assert(version === NETWORK_VERSION, `Invalid version`);
    
    const methodCount = buf[offset++];
    const methods = [];
    for (let i = 0; i < methodCount; i++) {
      methods.push(AUTH_METHODS.get(buf[offset++]));
    }
    
    session.offset = offset;
    return methods.filter(Boolean);
  }

  function handleRequest(buf) {
    session.buffer = Buffer.concat([session.buffer, buf]);
    
    const processBuffer = () => {
      session.buffer = session.buffer.slice(session.offset);
      session.offset = 0;
    };

    switch(session.state) {
      case STATE.HANDSHAKE:
        const methods = parseAuthMethods();
        if (methods.length) {
          const selected = methods.find(m => m === AUTH_METHODS.NO_AUTH);
          socket.write(Buffer.from([NETWORK_VERSION, selected[0]]);
          session.state = STATE.REQUEST;
          processBuffer();
        }
        break;
        
      case STATE.REQUEST:
        let offset = session.offset;
        const buf = session.buffer;
        
        const version = buf[offset++];
        const cmd = COMMAND_TYPES.get(buf[offset++]);
        const atyp = ADDR_TYPES.get(buf[offset++]);
        
        let host;
        if (atyp === ADDR_TYPES.IPV4) {
          host = `${buf[offset++]}.${buf[offset++]}.${buf[offset++]}.${buf[offset++]}`;
        } else if (atyp === ADDR_TYPES.DOMAIN) {
          const len = buf[offset++];
          host = buf.slice(offset, offset + len).toString();
          offset += len;
        }
        
        const port = buf.readUInt16BE(offset);
        session.offset = offset + 2;
        
        dns.lookup(host, (err, ip) => {
          if (err) {
            socket.end(Buffer.from([NETWORK_VERSION, RESPONSE_CODES.FAILURE[0], 0x00]));
            return;
          }
          
          const remote = net.connect({ host: ip, port }, () => {
            const reply = Buffer.from([
              NETWORK_VERSION, RESPONSE_CODES.SUCCESS[0], 0x00, 
              ADDR_TYPES.IPV4[0], ...utils.ipToBytes('0.0.0.0'), 0x00, 0x00
            ]);
            socket.write(reply);
            session.state = STATE.FORWARDING;
            socket.pipe(remote).pipe(socket);
          });
        });
        break;
    }
  }

  return {
    handle: handleRequest,
    _socket: socket,
    _session: session
  };
}

module.exports = createGateway;
