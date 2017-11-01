import Dropbox from 'dropbox';
import fs from 'fs';
import docToJson from '../scripts/docToJson';

export async function docLastModified() {
  const dropbox = new Dropbox({ accessToken: process.env.DBX });
  const res = await dropbox.filesListRevisions({
    path: '/Baby Daddy/BBDD.rtf'
  });
  return new Date(res.entries[0].client_modified);
}

export async function downloadDoc() {
  const dropbox = new Dropbox({ accessToken: process.env.DBX });
  const rtf = await dropbox.filesDownload({
    path: '/Baby Daddy/BBDD.rtf'
  });
  fs.writeFileSync('./BBDD.rtf', rtf.fileBinary);
}

export async function downloadAndProcessDoc() {
  await downloadDoc();
  await processDoc();
}

export async function processDoc() {
  console.log('PROCESS DOC');
  await docToJson({ input: './BBDD.rtf', output: './public/full.json' });
  console.log('PROCESS DOC COMPLETE');
}

export async function checkAndProcessDoc(lastModified) {
  const newLastMod = await docLastModified();
  if (lastModified === null) {
    return newLastMod;
  }
  console.log('CURRENT MODIFIED', lastModified);
  console.log('NEW MODIFIED', newLastMod);
  if (lastModified.getTime() !== newLastMod.getTime()) {
    downloadAndProcessDoc();
    return newLastMod;
  }
  return lastModified;
}
