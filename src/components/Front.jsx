import React, { PureComponent } from 'react';
import data from '../content/frontis.json';
import style from '../app.scss';

export default class Front extends PureComponent {
  render() {
    return (
      <div className={style.front}>
        {data.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    );
  }
}
