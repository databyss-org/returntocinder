import React from 'react';
import Entry from './Entry';

const Entries = ({
  entries,
  path,
  highlight,
  showRepeats,
  makeId,
  inlineHead,
  setScroll,
}) => {
  let lastLocation = null;
  let locationCount = 0;

  return (
    entries.map((entry, idx) => {
      if (entry.locations.low === lastLocation) {
        locationCount += 1;
      } else {
        locationCount = 0;
      }
      lastLocation = entry.locations.low;
      return (
        <Entry
          key={entry.id || (makeId && makeId(idx)) || path.join('.') + idx}
          entry={entry}
          highlight={highlight}
          path={path}
          cardinal={locationCount}
          showRepeats={showRepeats}
          inlineHead={idx ? null : inlineHead}
          setScroll={setScroll}
          scrollPos={idx}
        />
      );
    })
  );
};

export default Entries;
