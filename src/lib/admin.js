import fs from 'fs';
import DumpDbToBeta from '../scripts/dumpDbToBeta';
import DumpDb from '../scripts/dumpDb';
import RestoreDb from '../scripts/restoreDb';
import SupplementToDb from '../scripts/supplementToDb';

const { DB_DUMP_PATH } = process.env;
const { DB_NAME } = process.env;

function emitProcessEvents(proc, socket) {
  proc.on('end', (success) => {
    console.log('END', success);
    socket.emit('end', success);
  });
  proc.on('stdout', (msg) => {
    console.log(msg);
    socket.emit('stdout', msg);
  });
  proc.on('stderr', (msg) => {
    console.error(msg);
    socket.emit('stderr', msg);
  });
}

export function dumpToBeta(socket) {
  const dump = new DumpDbToBeta();
  emitProcessEvents(dump, socket);
  dump.run();
}

export function dumpDatabase(socket) {
  const dump = new DumpDb();
  emitProcessEvents(dump, socket);
  dump.run();
}

export function restoreDatabase(socket) {
  const restore = new RestoreDb();
  emitProcessEvents(restore, socket);
  restore.run();
}

export function importSupplement(socket, filename) {
  const batch = new SupplementToDb();
  emitProcessEvents(batch, socket);
  batch.run(filename);
}

export function getSnapshotMeta(cb) {
  fs.stat(`${DB_DUMP_PATH}/${DB_NAME}`, (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    cb({ date: stats.ctime });
  });
}
