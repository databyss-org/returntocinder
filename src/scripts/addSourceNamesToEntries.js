/* eslint-disable import/no-extraneous-dependencies, no-console */
import async from 'async';
import ora from 'ora';
import { connect } from '../lib/data/mongo';
import { list as listSources } from '../lib/data/sources';
import { biblioFromSources } from '../lib/indexers';

async function run(spinner) {
  const sources = await listSources();
  const sourcesDict = biblioFromSources(sources);

  const db = await connect();
  const collection = db.collection('entries');

  const q = async.queue((doc, callback) => {
    collection.update(
      {
        _id: doc._id,
      },
      {
        $set: { 'source.name': sourcesDict[doc.source.id].title },
      },
      {
        w: 1,
      },
      callback
    );
  }, Infinity);

  const cursor = collection.find();
  let count = 0;
  cursor.each((err, doc) => {
    if (err) throw err;
    count += 1;
    if (doc) q.push(doc); // dispatching doc to async.queue
  });

  q.drain = () => {
    if (cursor.isClosed()) {
      spinner.stop();
      console.log(`${count} entries processed`);
      process.exit();
    }
  };
}

const spinner = ora('Updating entries').start();
run(spinner);
