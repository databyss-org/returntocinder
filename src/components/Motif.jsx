import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class Motif extends PureComponent {
  render() {
    const { motif, style } = this.props;
    const { doc } = this.props.appState;

    return (
      <chapter key={motif} style={style}>
        <h2 dangerouslySetInnerHTML={{ __html: doc[motif].title }} />
        {Object.keys(doc[motif].sources).map((book, idx) => (
          <section key={motif + book}>
            {doc[motif].sources[book].map((entry, idx) => (
              <p
                key={motif + book + idx}
                dangerouslySetInnerHTML={{ __html: idx
                  ? entry
                  : `<h3>${book}</h3> ${entry}`
                }}
              />
            ))}
          </section>
        ))}
      </chapter>
    );
  }
}

export default connect(state => ({
  appState: state
}), null)(Motif);
