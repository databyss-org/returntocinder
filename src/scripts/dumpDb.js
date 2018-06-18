import dotenv from 'dotenv';
import ServerProcess from '../lib/ServerProcess';

class DumpDb extends ServerProcess {
  constructor(args) {
    super(args);
    dotenv.config();
  }
  async run() {
    const {
      DB_CLUSTER_URI_LIVE,
      DB_USER,
      DB_PASSWORD,
      DB_NAME,
      DB_DUMP_PATH,
    } = process.env;

    const cleanCmd = `rm -rf ${DB_DUMP_PATH}`;
    const dumpCmd =
      `mongodump --host ${DB_CLUSTER_URI_LIVE} --ssl --username ${DB_USER} --password ${DB_PASSWORD} --authenticationDatabase admin --db ${DB_NAME} --out ${DB_DUMP_PATH}`;

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
