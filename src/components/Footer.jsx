import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../app.scss';
import menuData from '../content/menu.json';

export default () => (
  <div className={styles.footer}>
    <ul className={styles.navLinks}>
      {menuData.map(items => items.map((item, idx) => item.footer && (
        <li key={idx}>
          <Link to={item.path}>{item.title}</Link>
        </li>
      )))}
    </ul>
  </div>
);
