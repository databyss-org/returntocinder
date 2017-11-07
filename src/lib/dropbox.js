/* eslint-disable no-console */

import Dropbox from 'dropbox';
import fs from 'fs';
import { promisify } from 'util';
import childProcess from 'child_process';
import queue from 'queue';
import docToJson from '../scripts/docToJson';
import notify from './notify';

const exec = promisify(childProcess.exec);

export default class Dbx {
  constructor({ fileList, gitUrl }) {
    console.log('CREATE DROPBOX SYNC', fileList, gitUrl);
    this.lastModified = fileList.map(f => ({
      ...f, lastModified: null
    }));
    this.isIndexing = false;
    this.gitUrl = gitUrl;
    this.q = queue({
      concurrency: 1,
      timeout: 60000 * 5, // 5 minutes
      autostart: true
    });
    this.q.on('end', () => this.onQueueEnd());
  }

  requestSync() {
    this.q.push(async () => {
      try {
        this.lastModified = await this.checkAndProcessDoc(this.lastModified);
      } catch (err) {
        console.log('JOB ERROR', JSON.stringify(err, null, 2));
      }
    });
  }

  onQueueEnd() {
    if (this.needsPush) {
      this.needsPush = false;
      this.push();
    }
  }

  async docLastModified(path) {
    const dropbox = new Dropbox({ accessToken: process.env.DBX });
    const res = await dropbox.filesListRevisions({ path });
    return new Date(res.entries[0].client_modified);
  }

  async downloadAndProcessDoc({ path, out }) {
    try {
      console.log('DOWNLOAD DOC', path);
      const dropbox = new Dropbox({ accessToken: process.env.DBX });
      const doc = await dropbox.filesDownload({ path });
      const filename = (p => p[p.length - 1])(path.split('/'));
      if (filename.match('.rtf')) {
        console.log('WRITE RTF', filename);
        fs.writeFileSync(filename, doc.fileBinary);
        await this.processDoc({ filename, out });
        // kick off async index job
        this.indexAndPush();
      } else {
        console.log('WRITE JSON', out);
        const fileBuffer = Buffer.from(doc.fileBinary, 'binary');
        const utf8 = fileBuffer.toString('utf8');
        fs.writeFileSync(out, utf8);
        this.needsPush = true;
      }
    } catch (err) {
      console.log('ERROR - downloadAndProcessDoc', err);
      console.log('path', path);
      console.log('out', out);
    }
  }

  async indexAndPush() {
    console.log('INDEX', this.gitUrl);
    const { stdout1, stderr1 } = await exec('npm run index');
    console.log('INDEX COMPLETE', stdout1, stderr1);
    const { stdout2, stderr2 } = await exec('npm run simplify');
    console.log('INDEX COMPLETE', stdout2, stderr2);
    await this.push();
  }

  async push() {
    const url = this.gitUrl;
    const { stdout1, stderr1 } = await exec('git status');
    const text = `
      FILES CHANGED:
      ${stdout1}

      ERRORS:
      ${stderr1}
    `;
    console.log('COMMIT AND PUSH', url);
    const { stdout2, stderr2 } = await exec(
      `git commit -a -m "content" && git pull ${url} && git push ${url} master`
    );
    console.log('PUSH COMPLETE', stdout2, stderr2);
    const res = await notify({ subject: 'Dropbox changes pushed', text });
    console.log(res);
  }

  async processDoc({ filename, out }) {
    console.log('PROCESS DOC');
    await docToJson({ input: `./${filename}`, output: out });
    console.log('PROCESS DOC COMPLETE');
  }

  async checkAndProcessDoc(spec) {
    const { path, out, lastModified } = spec;
    console.log('checkAndProcessDoc', path);
    const newLastMod = await this.docLastModified(path);
    if (!lastModified) {
      return { ...spec, lastModified: newLastMod };
    }
    console.log('CURRENT MODIFIED', lastModified);
    console.log('NEW MODIFIED', newLastMod);
    if (lastModified.getTime() !== newLastMod.getTime()) {
      await this.downloadAndProcessDoc({ path, out });
      return { ...spec, lastModified: newLastMod };
    }
    return { ...spec, lastModified };
  }

  async checkAndProcessDocs(files) {
    return Promise.all(files.map(f => this.checkAndProcessDoc(f)));
  }
}
