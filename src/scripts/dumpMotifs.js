import fs from 'fs';

const doc = JSON.parse(fs.readFileSync('./public/full.json'));
Object.keys(doc).forEach(motif => console.log(doc[motif].title));
