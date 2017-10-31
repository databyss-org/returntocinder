const express = require('express');
const basicAuth = require('express-basic-auth');
const compression = require('compression');
const path = require('path');

const app = express();

app.set('port', (process.env.PORT || 5000));

const middleware = [
  compression(),
  express.static('./public')
];

app.use(...middleware);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/oauth', (req, res) => {
  console.log(req);
  res.status(200).end();
});

app.listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});
