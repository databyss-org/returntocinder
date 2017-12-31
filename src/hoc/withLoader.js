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
        this.wasAllLoaded = false;
        this.loadedProps = {};
        this.loadingProps = {};
      }
      onMountAndUpdate(props) {
        const toLoad = propsToLoad(props);
        const loaders = loaderActions(props);
        this.isAllLoaded = Object.keys(toLoad).reduce((isLoaded, prop) => {
          if (toLoad[prop]) {
            this.loadingProps[prop] = false;
            return isLoaded;
          }
          if (!this.loadingProps[prop]) {
            loaders[prop]();
            this.loadingProps[prop] = true;
          }
          return false;
        }, true);
        if (this.isAllLoaded) {
          this.loadedProps = toLoad;
          this.wasAllLoaded = true;
        }
      }
      componentWillMount() {
        this.onMountAndUpdate(this.props);
      }
      componentWillReceiveProps(nextProps) {
        this.onMountAndUpdate(nextProps);
      }
      render() {
        if (this.wasAllLoaded) {
          return <Wrapped {...this.props} {...this.loadedProps} isLoading={!this.isAllLoaded} />;
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
