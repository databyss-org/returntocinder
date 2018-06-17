/* eslint-disable no-console */

import express from 'express';
import compression from 'compression';
import path from 'path';
import bodyParser from 'body-parser';
import userAgent from 'express-useragent';
import cors from 'cors';
import dotenv from 'dotenv';
import Dbx from './lib/dropbox';

import api from './server/api';
import sockets from './server/sockets';
import upload from './server/upload';
import sitemap from './server/sitemap';
// import motif from './server/motif';

dotenv.config();

const app = express();
let dbx = null;
if (process.env.DBX) {
  dbx = new Dbx({ fileList: [], gitUrl: process.env.GIT_URL });
}

app.set('port', (process.env.PORT || 5000));

const middleware = [
  userAgent.express(),
  compression(),
  ...(process.env.DBX ? [] : [express.static('./public')])
];

app.use(...middleware);

app.get('/dropbox-webhook', (req, res) => {
  res.send(req.query.challenge);
});

app.post('/dropbox-webhook', (req, res) => {
  console.log('---DBX---', req.body);
  dbx.requestSync();
  res.status(200).end();
});

// API
app.use('/api', cors(), bodyParser.json(), api);

// UPLOADS
app.use('/upload', cors(), upload);

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

// admin app
app.get('/admin', (req, res) => {
  res.sendFile(path.join(
    __dirname.replace('/build', '').replace('/src', ''),
    '/public/admin.html')
  );
});

// sitemap
app.get('/sitemap.txt', (req, res) => {
  res.send(sitemap().join("\n")); // eslint-disable-line quotes
});

// legacy !about redirects
app.get('/!about/:page', (req, res) => {
  res.redirect(301, `/about/${req.params.page}`);
});

function getClientApp(req, res) {
  if (process.env.DBX) {
    res.status(301).end();
  } else if (req.path.match(/\/source:(.*)?/)) {
    res.redirect(301, req.originalUrl.replace(/\/source:(.*)?/g, ''));
  } else if (req.path.match(/\/admin/)) {
    res.sendFile(path.join(
      __dirname.replace('/build', '').replace('/src', ''),
      '/public/admin.html')
    );
  } else {
    res.sendFile(path.join(
      __dirname.replace('/build', '').replace('/src', ''),
      '/public/index.html')
    );
  }
}

app.get('/*', getClientApp);
// app.get('/source/*.*', getClientApp);

sockets(app).listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});
