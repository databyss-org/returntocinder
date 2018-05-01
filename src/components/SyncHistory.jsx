import React from 'react';
import { withRouter } from 'react-router';

class SyncHistory extends React.Component {
  componentWillMount() {
    const { dispatchOnMount, onLocationChanged, location } = this.props;

    if (dispatchOnMount) {
      onLocationChanged(location.pathname);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { onLocationChanged, location } = this.props;

    if (location.pathname !== nextProps.location.pathname) {
      onLocationChanged(nextProps.location.pathname);
    }
  }
  render() {
    return this.props.children;
  }
}

SyncHistory.defaultProps = {
  dispatchOnMount: true
};

export default withRouter(SyncHistory);
