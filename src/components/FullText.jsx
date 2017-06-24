import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as appActions from '../actions';
import Search from './Search.jsx';
import { urlifyMotif } from '../lib/_helpers';
import qs from 'query-string';

class FullText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: null
    };
  }

  render() {
    const { doc } = this.props.appState;
    const queryMotif = qs.parse(this.props.location.search).motif;
    return doc ? (
      <div id="fullText">
        <Search />
        {Object.keys(doc).map(motif =>
          !queryMotif || (queryMotif === urlifyMotif(motif)) ? (
            <chapter key={motif}>
              <h2 dangerouslySetInnerHTML={{ __html: motif }} />
              {Object.keys(doc[motif]).map((book, idx) => (
                <section key={motif + book}>
                  {doc[motif][book].map((entry, idx) => (
                    <p
                      key={motif + book + idx}
                      dangerouslySetInnerHTML={{ __html: idx
                        ? entry
                        : `${book} ${entry}`
                      }}
                    />
                  ))}
                </section>
              ))}
            </chapter>
          ) : null
        )}
      </div>
    ) : (
      <div id="center">
        Loading...
      </div>
    );
  }
}

export default connect(state => ({
  appState: state
}), appActions)(FullText);
