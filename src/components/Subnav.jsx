import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import styles from '../app.scss';

class About extends PureComponent {
  constructor(props) {
    super(props);

    this.activeElem = null;
  }
  setActive(elem, item) {
    if (!elem) {
      return;
    }
    if (this.props.location.pathname !== item.path) {
      return;
    }
    console.log(this.activeElem)
    if (this.activeElem) {
      this.activeElem.style.left = `${elem.offsetLeft}px`;
      this.activeElem.innerHTML = item.title;
    }
  }
  render() {
    return (
      <div className={styles.subnav}>
        <div className={styles.active} ref={(e) => { this.activeElem = e; }} />
        <ul>
          {this.props.menu.map((item, idx) => (
            <li key={idx} ref={e => this.setActive(e, item)}>
              <Link to={item.path}>
                <span dangerouslySetInnerHTML={{ __html: item.title }} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default withRouter(About);
