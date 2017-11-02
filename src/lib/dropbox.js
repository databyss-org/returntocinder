/* eslint-disable no-console */

import Dropbox from 'dropbox';
import fs from 'fs';
import util from 'util';
import childProcess from 'child_process';
import docToJson from '../scripts/docToJson';

export async function docLastModified(path) {
  const dropbox = new Dropbox({ accessToken: process.env.DBX });
  const res = await dropbox.filesListRevisions({ path });
  return new Date(res.entries[0].client_modified);
}

export async function downloadAndProcessDoc({ path, out, compile }) {
  const dropbox = new Dropbox({ accessToken: process.env.DBX });
  const rtf = await dropbox.filesDownload({ path });
  const filename = (p => p[p.length - 1])(path.split('/'));
  fs.writeFileSync(filename, rtf.fileBinary);
  if (filename.match('.rtf')) {
    await processDoc({ filename, out });
  }
  if (compile) {
    compile();
  }
}

export async function compile() {
  const exec = util.promisify(childProcess.exec);
  const { stdout, stderr } = await exec('webpack -p --progress');
  console.log('COMPILE', stdout, stderr);
}

export async function processDoc({ filename, out }) {
  console.log('PROCESS DOC');
  await docToJson({ input: `./${filename}`, output: out });
  console.log('PROCESS DOC COMPLETE');
}

export async function checkAndProcessDoc({ path, out, compile, lastModified }) {
  const newLastMod = await docLastModified(path);
  if (!lastModified) {
    return { path, lastModified: newLastMod };
  }
  console.log('CURRENT MODIFIED', lastModified);
  console.log('NEW MODIFIED', newLastMod);
  if (lastModified.getTime() !== newLastMod.getTime()) {
    downloadAndProcessDoc(path);
    return { path, lastModified: newLastMod };
  }
  return { path, lastModified };
}

export async function checkAndProcessDocs(files) {
  return Promise.all(files.map(f => checkAndProcessDoc(f)));
}
