var express = require('express');
var path = require('path');
var app = express();
var basicAuth = require('express-basic-auth')
var compression = require('compression');

app.set('port', (process.env.PORT || 5000));
app.use(compression(), basicAuth({
  users: { 'babydaddy': 'borderline' },
  challenge: true,
  realm: 'Return to Cinder'
}), express.static('./public'));

app.get('/oauth', function(req, res) {
  console.log(req);
  res.status(200).end();
});

app.listen(app.get('port'), function() {
  console.log('server started on port', app.get('port'))
});
