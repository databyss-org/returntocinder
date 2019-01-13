import { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { sourceHash } from '../lib/url';
import actions from '../redux/app/actions';

class ScrollToTop extends Component {
  constructor(props) {
    super(props);
    this.history = [];
    this.hashChange = this.hashChange.bind(this);
  }
  scrollContainer({ container, location, prevProps }) {
    if (!container) {
      return;
    }
    if (this.history.length && this.prevPage().pathname === location.pathname) {
      const lastPage = this.history.pop();
      container.scrollTop = lastPage.scrollTop;
    } else {
      this.history.push({
        pathname: prevProps.location.pathname,
        scrollTop: container.scrollTop,
      });
      container.scrollTop = 0;

      // also (unrelated to scroll), hide the document modal on url change
      if (this.props.app.sourceModalIsActive) {
        this.props.toggleSourceModal();
      }
    }
  }
  prevPage() {
    return this.history[this.history.length - 1];
  }
  hashChange() {
    const { sourceModalIsActive } = this.props.app;
    const { history } = this.props;
    // if we pressed forward into a hash, remove the hash!
    if (sourceHash(window.location.hash) && !sourceModalIsActive) {
      history.replace(
        `${window.location.pathname}${
          window.location.search ? `?${window.location.search}` : ''
        }`
      );
    }
    // if hash changes, hide the doc modal
    if (!sourceHash(window.location.hash) && sourceModalIsActive) {
      this.props.toggleSourceModal();
    }
  }
  componentDidMount() {
    window.addEventListener('hashchange', this.hashChange, false);
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.hashChange, false);
  }

  componentDidUpdate(prevProps) {
    const { location, history, app } = this.props;
    if (!app.sourceModalIsActive && sourceHash(location.hash)) {
      history.replace(
        `${location.pathname}${location.search ? `?${location.search}` : ''}`
      );
    }
    if (
      location.pathname !== prevProps.location.pathname &&
      !sourceHash(location.hash)
    ) {
      const main = document.querySelectorAll('main')[0];
      const about = document.querySelectorAll('#about')[0];
      // first try about
      if (location.pathname.match('/about/')) {
        this.scrollContainer({ container: about, prevProps, location });
      } else if (main && !prevProps.location.pathname.match('/about/')) {
        this.scrollContainer({ container: main, prevProps, location });
      }
    }
  }
  render() {
    return this.props.children;
  }
}

export default compose(
  connect(
    state => state,
    actions
  ),
  withRouter
)(ScrollToTop);
