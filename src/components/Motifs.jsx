import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import actions from '../redux/app/actions';
import styles from '../app.scss';

class Motifs extends PureComponent {
  render() {
    const { doc } = this.props.appState;
    return (
      <ul className={styles.motifs}>
        {Object.keys(doc).map(m => (
          <li key={m}
            dangerouslySetInnerHTML={{ __html: doc[m].title }}
            onClick={() => this.props.history.push(`/motif/${m}`)}
          />
        ))}
      </ul>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
}), actions)(Motifs));
