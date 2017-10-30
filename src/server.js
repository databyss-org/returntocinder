import express from 'express';
import compression from 'compression';
import path from 'path';
import bodyParser from 'body-parser';
import { checkAndProcessDoc } from './lib/dropbox';

const app = express();

let lastModified = null;

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
  checkAndProcessDoc(lastModified).then((res) => {
    lastModified = res;
  }).catch((err) => {
    console.log('ERROR - checkAndProcessDoc', err);
  })
});


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname.replace('/build', ''), '/public/index.html'));
});

app.listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});

checkAndProcessDoc(lastModified).then((res) => {
  console.log('STARTUP LAST MODIFIED', res)
  lastModified = res;
}).catch((err) => {
  console.log('STARTUP ERROR - checkAndProcessDoc', err);
});
