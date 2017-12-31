import React, { PureComponent } from 'react';
import Loader from '../components/Loader.jsx';
import styles from '../app.scss';

export default function withLoader({
  propsToLoad,
  loaderActions,
  showLoader = true,
  className = styles.defer,
}) {
  return Wrapped =>
    class WithLoader extends PureComponent {
      constructor(props) {
        super(props);
        this.loading = {};
      }
      onMountAndUpdate(props) {
        this.loadedProps = propsToLoad(props);
        this.loaders = loaderActions(props);
        this.isAllLoaded = Object.keys(this.loadedProps).reduce((isLoaded, prop) => {
          if (this.loadedProps[prop]) {
            this.loading[prop] = false;
            return isLoaded;
          }
          if (!this.loading[prop]) {
            this.loaders[prop]();
            this.loading[prop] = true;
          }
          return false;
        }, true);
      }
      componentWillMount() {
        this.onMountAndUpdate(this.props);
      }
      componentWillReceiveProps(nextProps) {
        this.onMountAndUpdate(nextProps);
      }
      render() {
        if (this.isAllLoaded) {
          return <Wrapped {...this.props} {...this.loadedProps} />;
        }
        if (this.props.showLoader) {
          return (
            <div className={className}>
              <Loader />
            </div>
          );
        }
        return null;
      }
    };
}
