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
      ...f,
      path: process.env.DEBUG === '1' && f.testPath ? f.testPath : f.path,
      lastModified: null
    }));
    this.isIndexing = false;
    this.gitUrl = gitUrl;
    this.q = queue({
      concurrency: 1,
      timeout: 60000 * 5, // 5 minutes
      autostart: true
    });
    this.q.on('end', () => this.onQueueEnd());

    // CLONE REPO
    this.cloneRepo();

    // SET INITIAL LAST MODIFIEDS
    this.checkAndProcessDocs(this.lastModified).then((lastMod) => {
      console.log('STARTUP LAST MODIFIED', lastMod);
      this.lastModified = lastMod;
    }).catch((err) => {
      console.log('STARTUP ERROR - checkAndProcessDocs', err);
    });
  }

  requestSync() {
    this.q.push(async () => {
      try {
        this.lastModified = await this.checkAndProcessDocs(this.lastModified);
      } catch (err) {
        console.log('JOB ERROR', JSON.stringify(err, null, 2));
      }
    });
  }

  onQueueEnd() {
    if (this.needsPush) {
      this.needsPush = false;
      this.push().catch(err => console.log('PUSH ERROR', err));
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
    console.log('INDEX');
    try {
      await exec('npm run index ./repo/public');
      await exec('npm run simplify ./repo/public');
      await this.push();
    } catch (err) {
      console.log('ERROR - indexAndPush', err);
    }
  }

  async cloneRepo() {
    await exec('ssh-keyscan heroku.com >> ~/.ssh/known_hosts');
    await exec(`git config --global user.email "${process.env.NOTIFY_SENDER}"`);
    await exec('git config --global user.name "Dropbox Sync"');
    await exec(`git clone ${this.gitUrl} repo`);
  }

  async push() {
    const url = this.gitUrl;
    const { stdout } = await exec('cd repo && git status');
    console.log('COMMIT AND PUSH', url);
    await exec('cd repo && git commit -a -m "content update" && git pull && git push');
    const res = await notify({ subject: 'Dropbox changes pushed', text: stdout });
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
