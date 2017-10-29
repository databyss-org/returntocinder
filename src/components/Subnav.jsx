import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from '../app.scss';

export default class About extends PureComponent {
  render() {
    return (
      <ul className={styles.subnav}>
        {this.props.menu.map((item, idx) => (
          <li key={idx}>
            <Link to={item.path}>
              <span dangerouslySetInnerHTML={{ __html: item.title }} />
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}
