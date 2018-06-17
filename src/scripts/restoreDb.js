import dotenv from 'dotenv';
import ServerProcess from '../lib/ServerProcess';

class RestoreDb extends ServerProcess {
  constructor(args) {
    super(args);
    dotenv.config();
  }
  async run() {
    const {
      DB_CLUSTER_URI_LIVE,
      DB_USER,
      DB_PASSWORD,
      DB_DUMP_PATH,
    } = process.env;

    const restoreCmd =
      `mongorestore --host ${DB_CLUSTER_URI_LIVE} --ssl --username ${DB_USER} --password ${DB_PASSWORD} --authenticationDatabase admin --drop ${DB_DUMP_PATH}`;

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
