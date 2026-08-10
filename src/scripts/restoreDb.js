import dotenv from 'dotenv';
import ServerProcess from '../lib/ServerProcess';

const DEFAULT_DUMP_PATH = './dump';

function quote(value) {
  return `"${value}"`;
}

class RestoreDb extends ServerProcess {
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
    const restoreTarget = `${dumpPath}/${DB_NAME}`;

    const restoreCmd = `mongorestore --uri ${quote(DATABASE_URL)} --db ${DB_NAME} --drop ${quote(restoreTarget)}`;

    try {
      this.emit('stdout', 'RESTORING DATA...');
      await this.exec(restoreCmd);
      this.emit('end', true);
    } catch (err) {
      this.emit('end', false);
    }
  }
}

export default RestoreDb;

if (require.main === module) {
  const restore = new RestoreDb();
  restore.on('end', (success) => {
    process.exit();
  });
  restore.on('stdout', (msg) => {
    console.log(msg);
  });
  restore.on('stderr', (msg) => {
    console.error(msg);
  });
  restore.run();
}
