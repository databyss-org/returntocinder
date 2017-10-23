import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import appActions from '../redux/app/actions';
import searchActions from '../redux/search/actions';
import styles from '../app.scss';
import LoadingIcon from '../icons/loading.svg';

class Loader extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      processing: null,
      queue: props.queue
    };
  }

  processAction() {
    const { onComplete } = this.props;
    if (!this.state.queue) {
      return;
    }

    if (!this.state.queue.length) {
      this.setState({ processing: null });
      onComplete && onComplete(this.props);
      return;
    }
    // shift the first item from the queue and process it
    const queue = [...this.state.queue];
    const processing = queue.shift();
    processing.forEach(def => def.action(this.props));
    this.setState({ queue, processing });
  }

  componentWillMount() {
    this.processAction();
  }

  componentWillReceiveProps(nextProps) {
    const { processing } = this.state;

    // check action complete condition on current action
    if (!processing) {
      // nothing being processed
      return;
    }
    if (processing.reduce((c, a) => c && a.completeWhen(nextProps), true)) {
      // process next action in queue
      this.processAction();
    }
  }

  render() {
    return this.state.processing || this.props.displayOnly ?
      <div className={styles.loader}>
        <LoadingIcon />
        <p>loading&nbsp;and<br />indexing</p>
      </div> : null;
  }
}

export default connect(state => ({
  appState: state.app,
  searchState: state.search
}), { ...appActions, ...searchActions })(Loader);
