/* eslint-disable no-console */

import express from 'express';
import compression from 'compression';
import path from 'path';
import bodyParser from 'body-parser';
import userAgent from 'express-useragent';
import cors from 'cors';
import dotenv from 'dotenv';
import nakedRedirect from 'express-naked-redirect';
import api from './server/api';
import sockets from './server/sockets';
import upload from './server/upload';
import sitemap from './server/sitemap';
import { renderMetaTemplate } from './lib/template';
// import motif from './server/motif';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 5000);

const middleware = [
  nakedRedirect(true), // redirect from www.returntocinder.com to returntocinder.com
  userAgent.express(),
  compression(),
  express.static('./public'),
];

async function getClientApp(req, res) {
  const { API_ADMIN_TOKEN } = process.env;

  if (req.path.match(/\/source:(.*)?/)) {
    return res.redirect(301, req.originalUrl.replace(/\/source:(.*)?/g, ''));
  }

  const indexFilename = API_ADMIN_TOKEN ? 'admin' : 'index';
  const templatePath = path.join(
    __dirname.replace('/build', '').replace('/src', ''),
    `/public/${indexFilename}.html`
  );
  try {
    const rendered = await renderMetaTemplate({
      templatePath,
      requestPath: req.path,
      extraDict: {
        PRODUCTION: (process.env.NODE_ENV === 'production').toString(),
      },
    });
    return res.send(rendered);
  } catch (err) {
    console.error(err);
    return res.status(501).end();
  }
}

app.get('/', getClientApp);
app.use(...middleware);

// API
app.use('/api', cors(), bodyParser.json(), api);

// UPLOADS
app.use('/upload', cors(), upload);

// sitemap
app.get('/sitemap.txt', (req, res) => {
  res.send(sitemap().join('\n')); // eslint-disable-line quotes
});

// legacy !about redirects
app.get('/!about/:page', (req, res) => {
  res.redirect(301, `/about/${req.params.page}`);
});

app.get('/*', getClientApp);

sockets(app).listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});
