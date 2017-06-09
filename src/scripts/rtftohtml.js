/* eslint-disable no-console */
import fs from 'fs';
import { fromStream } from '../lib/rtfToHtml';

fromStream(fs.createReadStream('../doc/test3.rtf'), (err, html) => {
  console.log(html);
  if (err) {
    console.error(err);
  }
});
