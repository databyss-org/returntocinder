import { Server } from 'http';
import socketio from 'socket.io';
import { dumpToBeta,
  getSnapshotMeta,
  dumpDatabase,
  restoreDatabase,
  importSupplement
} from '../lib/admin';
import {
  isAdminAuthConfigured,
  verifyAdminToken,
} from './adminAuth';

function getSocketToken(socket) {
  if (socket.handshake && socket.handshake.query && socket.handshake.query.adminToken) {
    return socket.handshake.query.adminToken;
  }
  return socket.request && socket.request.headers
    ? socket.request.headers.authorization
    : '';
}

const sockets = (app) => {
  const http = Server(app);
  const io = socketio(http);

  io.on('connection', (socket) => {
    console.log('Socket.io connection');

    socket.on('admin', (action, arg2) => {
      if (!isAdminAuthConfigured()) {
        socket.emit('stderr', 'Admin auth is not configured.');
        socket.emit('end', false);
        return;
      }

      if (!verifyAdminToken(getSocketToken(socket))) {
        socket.emit('stderr', 'Not authorized.');
        socket.emit('end', false);
        return;
      }

      switch (action) {
        case 'dumptobeta': {
          dumpToBeta(socket);
          break;
        }
        case 'makesnapshot': {
          dumpDatabase(socket);
          break;
        }
        case 'restoresnapshot': {
          restoreDatabase(socket);
          break;
        }
        case 'snapshotmeta': {
          getSnapshotMeta(arg2);
          break;
        }
        case 'importsupplement': {
          importSupplement(socket, arg2);
          break;
        }
        default: {
          socket.emit('stderr', `Unknown admin action: ${action}`);
          socket.emit('end', false);
        }
      }
    });
  });

  return http;
};

export default sockets;
