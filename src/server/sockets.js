import { Server } from 'http';
import socketio from 'socket.io';
import { dumpToBeta,
  getSnapshotMeta,
  dumpDatabase,
  restoreDatabase,
  importSupplement
} from '../lib/admin';

const { API_ADMIN_TOKEN } = process.env;

const sockets = (app) => {
  const http = Server(app);
  const io = socketio(http);

  io.on('connection', (socket) => {
    console.log('Socket.io connection');

    socket.on('admin', (action, arg2) => {
      if (socket.request.headers.authorization !== API_ADMIN_TOKEN) {
        throw new Error('Not authorized');
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
      }
    });
  });

  return http;
};

export default sockets;
