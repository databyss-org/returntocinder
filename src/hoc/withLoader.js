import React, { PureComponent } from 'react';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import styles from '../app.scss';

import LoadingIcon from '../icons/loading.svg';

export default function withLoader({
  propsToLoad,
  loaderActions,
  showLoader = true,
  delayLoader = 1500
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
      renderLoader(inProp) {
        return (
          <Transition in={inProp} timeout={delayLoader}>
            {state =>
              <div
                className={cx(styles.defer, {
                  [styles.entering]: state === 'entering',
                  [styles.entered]: state === 'entered',
                })}
              >
                <div className={styles.loader}>
                  <LoadingIcon />
                  <p>loading</p>
                </div>
              </div>
            }
          </Transition>
        );
      }
      render() {
        return [
          ...(this.wasAllLoaded ? [(
            <Wrapped {...this.props} {...this.loadedProps} isLoading={!this.isAllLoaded} />
          )] : []),
          this.renderLoader(!this.isAllLoaded && showLoader)
        ];
      }
    };
}
