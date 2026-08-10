import dotenv from 'dotenv';
import ServerProcess from '../lib/ServerProcess';

const DEFAULT_DUMP_PATH = './dump';

function quote(value) {
  return `"${value}"`;
}

class DumpDb extends ServerProcess {
  constructor(args) {
    super(args);
    dotenv.config();
  }
  async run() {
    const {
      DATABASE_URL,
      DB_NAME,
      DB_DUMP_PATH,
    } = process.env;

    const dumpPath = DB_DUMP_PATH || DEFAULT_DUMP_PATH;

    const cleanCmd = `rm -rf ${quote(dumpPath)}`;
    const dumpCmd = `mongodump --uri ${quote(DATABASE_URL)} --db ${DB_NAME} --out ${quote(dumpPath)}`;

    try {
      this.emit('stdout', 'CLEANING PREVIOUS DUMP...');
      await this.exec(cleanCmd);
      this.emit('stdout', 'DUMPING DATA...');
      await this.exec(dumpCmd);
      this.emit('end', true);
    } catch (err) {
      this.emit('end', false);
    }
  }
}

export default DumpDb;

if (require.main === module) {
  const dump = new DumpDb();
  dump.on('end', (success) => {
    process.exit();
  });
  dump.on('stdout', (msg) => {
    console.log(msg);
  });
  dump.on('stderr', (msg) => {
    console.error(msg);
  });
  dump.run();
}
