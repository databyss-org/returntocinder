import React, { PureComponent } from 'react';

export default function withAction(action) {
  return Wrapped =>
    class WithAction extends PureComponent {
      componentWillMount() {
        action(this.props);
      }
      componentWillReceiveProps(nextProps) {
        action(nextProps);
      }
      render() {
        return <Wrapped {...this.props}/>;
      }
    };
}
