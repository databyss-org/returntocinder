import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import styles from '../app.scss';

class Source extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      entry: null
    };
  }
  componentDidMount() {
    this.onPathChange(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.onPathChange(nextProps);
  }
  onPathChange(props) {
    if (props.sid) {
      this.setState({
        entry: this.props.appState.biblio[props.sid]
      });
    }
  }
  render() {
    if (!this.state.entry) {
      return null;
    }
    const { entry } = this.state;
    return (
      <div className={styles.source}>
        <h2 dangerouslySetInnerHTML={{ __html: entry.title }} />
        {entry.citations.map((citation, idx) =>
          <p key={idx} dangerouslySetInnerHTML={{ __html: citation }} />
        )}
      </div>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
}), null)(Source));
