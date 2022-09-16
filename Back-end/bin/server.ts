#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app';
import debug from 'debug';
debug('ts-node:server');
import http from 'http';
import dotenv from 'dotenv';
import { createSocketIo } from '../methods/chat/chat';
import { batchDelSockets } from '../utils/redis';
import { ENV_PATH } from '../config/constant';
dotenv.config({ path: ENV_PATH });

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '4001');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
createSocketIo(server); // 创建socketIo
batchDelSockets(); // 每次服务重启的时候都需要删除以前的socket
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
  console.log(`listening on ${port}`);
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr!.port; //加一个！就是把null类型排除
  debug('Listening on ' + bind);
}
