import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import styles from '../app.scss';

class Subnav extends PureComponent {
  constructor(props) {
    super(props);

    this.activeElem = null;
  }
  makePath(path) {
    return `${this.props.basePath}/${path}`;
  }
  setActive(elem, item) {
    if (!elem) {
      return;
    }
    if (!this.props.location.pathname.match(this.makePath(item.path))) {
      return;
    }
    if (this.activeElem) {
      this.activeElem.style.left = `${elem.offsetLeft}px`;
      this.activeElem.innerHTML = item.title;
    }
  }
  render() {
    const { location, menu } = this.props;

    return (
      <div className={styles.subnav}>
        <div className={styles.active} ref={(e) => { this.activeElem = e; }} />
        <ul>
          {menu.map((item, idx) => (
            <li key={idx} ref={e => this.setActive(e, item)}>
              <Link to={
                location.pathname.replace(/\/!about\/.+/, this.makePath(item.path))
              }>
                <span dangerouslySetInnerHTML={{ __html: item.title }} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default withRouter(Subnav);
