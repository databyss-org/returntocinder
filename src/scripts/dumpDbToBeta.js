import dotenv from 'dotenv';
import ServerProcess from '../lib/ServerProcess';

class DumpDbToBeta extends ServerProcess {
  constructor(args) {
    super(args);
    dotenv.config();
  }
  async run() {
    const {
      DB_CLUSTER_URI_LIVE,
      DB_CLUSTER_URI_BETA,
      DB_USER,
      DB_PASSWORD,
      DB_NAME,
      DB_DUMP_PATH,
    } = process.env;

    const dumpCmd =
      `mongodump --host ${DB_CLUSTER_URI_LIVE} --ssl --username ${DB_USER} --password ${DB_PASSWORD} --authenticationDatabase admin --db ${DB_NAME} --out ${DB_DUMP_PATH}`;

    const restoreCmd =
      `mongorestore --host ${DB_CLUSTER_URI_BETA} --ssl --username ${DB_USER} --password ${DB_PASSWORD} --authenticationDatabase admin --drop ${DB_DUMP_PATH}`;

    try {
      this.emit('stdout', 'DUMPING DATA...');
      await this.exec(dumpCmd);
      this.emit('stdout', 'RESTORING DATA...');
      await this.exec(restoreCmd);
      this.emit('end', true);
    } catch (err) {
      this.emit('end', false);
    }
  }
}

export default DumpDbToBeta;

if (require.main === module) {
  const dump = new DumpDbToBeta();
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
