import 'babel-polyfill';
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import EntriesByMotif from '../components/EntriesByMotif';
import ColumnHead from '../components/ColumnHead';

const motif = (mid) => {
  const doc = JSON.parse(fs.readFileSync('./public/full.json'));
  return renderToString(
    <StaticRouter location={`/motif/${mid}`} context={{}}>
      <main>
        <ColumnHead
          query={{ motif: true, term: mid, type: 'motif' }}
          doc={doc}
          styles={{}}
        />
        <EntriesByMotif
          doc={doc}
          mid={mid}
          key={1}
          path={['main']}
          />
      </main>
    </StaticRouter>
  );
};

export default motif;
