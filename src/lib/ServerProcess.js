import EventEmitter from 'events';
import { exec } from 'child_process';

class ServerProcess extends EventEmitter {
  stdOut(...msgs) {
    this.emit('stdout', msgs.join(' '));
  }
  stdErr(...msgs) {
    this.emit('stderr', msgs.join(' '));
  }
  exec(cmd) {
    return new Promise((resolve, reject) => {
      const child = exec(cmd);
      child.stdout.on('data', (data) => {
        this.stdOut(data);
      });
      child.stderr.on('data', (data) => {
        this.stdErr(data);
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
