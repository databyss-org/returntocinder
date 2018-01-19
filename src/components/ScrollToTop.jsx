import { Component } from 'react';
import { withRouter } from 'react-router';

class ScrollToTop extends Component {
  constructor(props) {
    super(props);
    this.history = [];
  }
  scrollContainer({ container, location, prevProps }) {
    if (!container) {
      return;
    }
    if (
      this.history.length &&
      this.prevPage().pathname === location.pathname
    ) {
      const lastPage = this.history.pop();
      container.scrollTop = lastPage.scrollTop;
    } else {
      this.history.push({
        pathname: prevProps.location.pathname,
        scrollTop: container.scrollTop
      });
      container.scrollTop = 0;
    }
  }
  prevPage() {
    return this.history[this.history.length - 1];
  }
  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (location.pathname !== prevProps.location.pathname && !location.hash) {
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

export default withRouter(ScrollToTop);
