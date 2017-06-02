var express = require('express');
var path = require('path');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static('./public'));

app.get('/oauth', function(req, res) {
  console.log(req);
  res.status(200).end();
});

app.listen(app.get('port'), function() {
  console.log('server started on port', app.get('port'))
});
