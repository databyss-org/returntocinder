/* eslint-disable no-console */

import express from 'express';
import compression from 'compression';
import path from 'path';
import bodyParser from 'body-parser';
import userAgent from 'express-useragent';
import cors from 'cors';
import Dbx from './lib/dropbox';
import contentFiles from './content';

import api from './server/api';
import sitemap from './server/sitemap';
// import motif from './server/motif';

const app = express();
let dbx = null;
if (process.env.DBX) {
  dbx = new Dbx({ fileList: contentFiles, gitUrl: process.env.GIT_URL });
}

app.set('port', (process.env.PORT || 5000));

const middleware = [
  userAgent.express(),
  compression(),
  ...(process.env.DBX ? [] : [express.static('./public')])
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
});

// SEARCH API
app.use('/api', cors(), api);

// Server router
/*
app.get('/motif/:mid', (req, res, next) => {
  if (!req.useragent.isBot) {
    next();
  } else {
    res.send(motif(req.params.mid));
  }
});
*/

// sitemap
app.get('/sitemap.txt', (req, res) => {
  res.send(sitemap().join("\n")); // eslint-disable-line quotes
});

// legacy !about redirects
app.get('/!about/:page', (req, res) => {
  res.redirect(301, `/about/${req.params.page}`);
});

app.get('/*', (req, res) => {
  if (process.env.DBX) {
    res.status(301).end();
  } else if (req.path.match(/\/source:(.*)?/)) {
    res.redirect(301, req.originalUrl.replace(/\/source:(.*)?/g, ''));
  } else {
    res.sendFile(path.join(
      __dirname.replace('/build', '').replace('/src', ''),
      '/public/index.html')
    );
  }
});

app.listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});
