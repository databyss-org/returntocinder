import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import appActions from '../redux/app/actions';
import searchActions from '../redux/search/actions';

export default function loader(Wrapped, queue) {
  class Loader extends PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        processing: null,
        queue
      };
    }

    processAction() {
      if (!this.state.queue.length) {
        this.setState({ processing: null });
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
      if (this.state.processing) {
        return this.state.processing ?
          <div style={ {
            zIndex: 100,
            position: 'relative',
            color: 'rgba(255,255,255,0.4)',
            top: 100
          }}>
            {this.state.processing.map((a, idx) => (
              <div key={idx}>{a.message}</div>
            ))}
          </div> : null;
      }

      return <Wrapped />;
    }
  }

  return connect(state => ({
    appState: state.app,
    searchState: state.search
  }), { ...appActions, ...searchActions })(Loader);
}
