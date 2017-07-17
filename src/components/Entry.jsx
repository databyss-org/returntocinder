import React, { PureComponent } from 'react';
import Highlighter from 'react-highlight-words';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class Motif extends PureComponent {
  render() {
    const { eid, style } = this.props;
    const { entries } = this.props.appState;
    const entry = entries[eid];

    return (
      <section style={style}>
        <h3>
          <span dangerouslySetInnerHTML={{ __html: entry.motif.title }} />
          ::
          <span dangerouslySetInnerHTML={{ __html: entry.source.display }} />
        </h3>
        <p dangerouslySetInnerHTML={{ __html: entry.content }} />
      </section>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
  searchState: state.search
}), null)(Motif));
