import React, { PureComponent } from 'react';
import frontis from '../../public/frontis.json';
import style from '../app.scss';

export default class Front extends PureComponent {
  render() {
    return (
      <div className={style.frontis}>
        {frontis.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    );
  }
}
