import React, { PureComponent } from 'react';
import Entry from './Entry.jsx';

export default class Entries extends PureComponent {
  render() {
    const {
      entries,
      path,
      highlight,
      showRepeats,
      makeId,
      inlineHead,
      setScroll
    } = this.props;

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
          />
        );
      })
    );
  }
}
