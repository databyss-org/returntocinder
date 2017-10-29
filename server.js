const express = require('express');
const basicAuth = require('express-basic-auth');
const compression = require('compression');
const path = require('path');
const bodyParser = require('body-parser');
const Dropbox = require('dropbox');

const app = express();

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
});


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});

function checkDocRevisions() {
  const dropbox = new Dropbox({ accessToken: process.env.DBX });
  dropbox.filesListRevisions({
    path: '/Baby Daddy/BBDD.rtf'
  }).then((res) => {
    console.log(res);
  }).catch((err) => {
    console.log(err);
  });
}
