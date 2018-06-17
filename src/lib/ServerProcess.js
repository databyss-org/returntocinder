import EventEmitter from 'events';
import { exec } from 'child_process';

class ServerProcess extends EventEmitter {
  exec(cmd) {
    return new Promise((resolve, reject) => {
      const child = exec(cmd);
      child.stdout.on('data', (data) => {
        this.emit('stdout', data);
      });
      child.stderr.on('data', (data) => {
        this.emit('stderr', data);
      });
      child.on('close', (data) => {
        resolve();
      });
      child.on('error', (data) => {
        reject(data);
      });
    });
  }
}

export default ServerProcess;
