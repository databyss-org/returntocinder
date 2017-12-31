import React, { PureComponent } from 'react';

export default function freezeProps({ propsToFreeze }) {
  return Wrapped =>
    class FreezeProps extends PureComponent {
      constructor(props) {
        super(props);
        this.normalProps = {};
        this.frozenProps = {};
      }
      updateProps(props) {
        const shouldFreeze = propsToFreeze(props);
        Object.keys(props).forEach((key) => {
          // only freeze the prop if it has a value (isn't undefined)
          if (shouldFreeze[key] || this.frozenProps[key] === undefined) {
            this.frozenProps[key] = props[key];
          } else if (!(key in shouldFreeze)) {
            this.normalProps[key] = props[key];
          }
        });
      }
      componentWillMount() {
        this.updateProps(this.props);
      }
      componentWillReceiveProps(nextProps) {
        this.updateProps(nextProps);
      }
      render() {
        return <Wrapped {...this.frozenProps} {...this.normalProps}/>;
      }
    };
}
