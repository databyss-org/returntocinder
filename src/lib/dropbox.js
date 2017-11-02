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
  try {
    console.log('DOWNLOAD DOC', path);
    const dropbox = new Dropbox({ accessToken: process.env.DBX });
    const doc = await dropbox.filesDownload({ path });
    const filename = (p => p[p.length - 1])(path.split('/'));
    if (filename.match('.rtf')) {
      console.log('WRITE DOC', filename);
      fs.writeFileSync(filename, doc.fileBinary);
      await processDoc({ filename, out });
    }
    if (compile) {
      console.log('WRITE DOC', out);
      fs.writeFileSync(out, doc.fileBinary);
      await compile();
    }
  } catch (err) {
    console.log('ERROR - downloadAndProcessDoc', err);
    console.log('path', path);
    console.log('out', out);
    console.log('compile', compile);
  }
}

export async function compile() {
  console.log('COMPILE');
  const exec = util.promisify(childProcess.exec);
  const { stdout, stderr } = await exec('webpack -p --progress');
  console.log('COMPILE COMPLETE', stdout, stderr);
}

export async function processDoc({ filename, out }) {
  console.log('PROCESS DOC');
  await docToJson({ input: `./${filename}`, output: out });
  console.log('PROCESS DOC COMPLETE');
}

export async function checkAndProcessDoc(spec) {
  const { path, out, compile, lastModified } = spec;
  console.log('checkAndProcessDoc', path);
  const newLastMod = await docLastModified(path);
  if (!lastModified) {
    return { ...spec, lastModified: newLastMod };
  }
  console.log('CURRENT MODIFIED', lastModified);
  console.log('NEW MODIFIED', newLastMod);
  if (lastModified.getTime() !== newLastMod.getTime()) {
    downloadAndProcessDoc({ path, out, compile });
    return { ...spec, lastModified: newLastMod };
  }
  return { ...spec, lastModified };
}

export async function checkAndProcessDocs(files) {
  return Promise.all(files.map(f => checkAndProcessDoc(f)));
}
