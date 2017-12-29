import React from 'react';
import Loader from '../components/Loader.jsx';
import styles from '../app.scss';

export default function withLoader({
  propsToLoad,
  loaderActions,
  showLoader = true,
  className = styles.defer,
}) {
  return Wrapped =>
    (props) => {
      const loadedProps = propsToLoad(props);
      const loaders = loaderActions(props);
      console.log('withLoader', props, loadedProps, loaders);
      const isAllLoaded = Object.keys(loadedProps).reduce((isLoaded, prop) => {
        if (loadedProps[prop]) {
          return isLoaded;
        }
        loaders[prop]();
        return false;
      }, true);
      if (isAllLoaded) {
        return <Wrapped {...props} {...loadedProps} />;
      }
      if (showLoader) {
        return (
          <div className={className}>
            <Loader />
          </div>
        );
      }
      return null;
    };
}
