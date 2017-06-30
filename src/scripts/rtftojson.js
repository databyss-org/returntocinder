/* eslint-disable no-console */
import fs from 'fs';
import { fromStream } from '../lib/rtfToJson';

fromStream(fs.createReadStream('../doc/full.rtf'), (err, json) => {
  if (err) {
    console.error(err);
    return;
  }
  fs.writeFile('./public/full.json', json);
});