/* eslint-disable no-console */

import express from 'express';
import compression from 'compression';
import path from 'path';
import bodyParser from 'body-parser';
import Dbx from './lib/dropbox';
import contentFiles from './content';

const app = express();
const dbx = new Dbx({ fileList: contentFiles, gitUrl: process.env.GIT_URL });

app.set('port', (process.env.PORT || 5000));

const middleware = [
  compression(),
  express.static('./public')
];

app.use(...middleware);
app.use(bodyParser.json());

app.get('/dropbox-webhook', (req, res) => {
  res.send(req.query.challenge);
});

app.post('/dropbox-webhook', (req, res) => {
  console.log('---DBX---', req.body);
  dbx.requestSync();
  res.status(200).end();
  // checkAndProcessDocs(lastModified).then((lastMod) => {
  //   lastModified = lastMod;
  //   res.status(200).end();
  // }).catch((err) => {
  //   console.log('ERROR - checkAndProcessDoc', err);
  //   res.status(301).end();
  // });
});


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname.replace('/build', ''), '/public/index.html'));
});

app.listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});
