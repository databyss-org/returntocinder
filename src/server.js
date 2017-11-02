/* eslint-disable no-console */

import express from 'express';
import compression from 'compression';
import path from 'path';
import bodyParser from 'body-parser';
import { checkAndProcessDocs } from './lib/dropbox';
import contentFiles from './content';

const app = express();

let lastModified = contentFiles.map(f => ({
  ...f, lastModified: null
}));

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
  checkAndProcessDocs(lastModified).then((lastMod) => {
    lastModified = lastMod;
    res.status(200).end();
  }).catch((err) => {
    console.log('ERROR - checkAndProcessDoc', err);
    res.status(301).end();
  });
});


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname.replace('/build', ''), '/public/index.html'));
});

app.listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});

checkAndProcessDocs(lastModified).then((lastMod) => {
  console.log('STARTUP LAST MODIFIED', lastMod);
  lastModified = lastMod;
}).catch((err) => {
  console.log('STARTUP ERROR - checkAndProcessDoc', err);
});
