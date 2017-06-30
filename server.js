const express = require('express');
const basicAuth = require('express-basic-auth');
const compression = require('compression');

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(compression(), basicAuth({
  users: { 'babydaddy': 'borderline' },
  challenge: true,
  realm: 'Return to Cinder'
}), express.static('./public'));

app.get('/oauth', (req, res) => {
  console.log(req);
  res.status(200).end();
});

app.listen(app.get('port'), () => {
  console.log('server started on port', app.get('port'));
});
