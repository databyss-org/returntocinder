const fs = require('fs');
const rtfToHTML = require('@iarna/rtf-to-html');

rtfToHTML.fromStream(fs.createReadStream('../doc/full.rtf'), (err, html) => {
  console.log(html);
});
