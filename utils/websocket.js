const http = require('http');
const https = require('https');
const socket = require('socket.io');
const token = require('./token');

let server;
let io;

function attachSocketIO (site, option) {
  if (site) {
    server = option
      ? https.createServer(option, site)
      : http.createServer(site);
    io = socket(server, { path: '/api/ws' });
    io.on('connection', socket => {
      console.log('Client connected!');
      if (socket.handshake.query.token !== token) {
        // Unauthorized connecton, disconnect it.
        console.log([socket.handshake.query.token, token]);
        return socket.disconnect();
      }
    });
  }
  return { io, server };
}

Object.defineProperty(attachSocketIO, 'io', {
  get: function () {
    return io;
  }
});

Object.defineProperty(attachSocketIO, 'server', {
  get: function () {
    return server;
  }
});

module.exports = {
  attach: attachSocketIO,
  get io () { return io; },
  get server () { return server; }
};
