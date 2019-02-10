/* eslint-disable import/no-extraneous-dependencies, no-console */
import async from 'async';
import ora from 'ora';
import { connect } from '../lib/data/mongo';
import { list as listMotifs } from '../lib/data/motifs';
import { makeStemDict, linkMotifsInEntry } from '../lib/indexers';

async function run(spinner) {
  const motifs = await listMotifs();
  const motifDict = motifs.reduce((dict, motif) => {
    dict[motif.id] = motif.name;
    return dict;
  }, {});
  const stemDict = makeStemDict(motifDict);

  const db = await connect();
  const collection = db.collection('entries');

  const q = async.queue((doc, callback) => {
    collection.update(
      {
        _id: doc._id,
      },
      {
        $set: {
          linkedContent: linkMotifsInEntry({
            content: doc.content,
            stemDoc: stemDict,
          }).entry,
        },
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
    if (doc) {
      q.push(doc); // dispatching doc to async.queue
      count += 1;
    }
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
