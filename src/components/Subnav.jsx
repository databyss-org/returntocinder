import React, { PureComponent } from 'react'
import { Link, withRouter } from 'react-router-dom'
import styles from '../app.scss'

class Subnav extends PureComponent {
  constructor(props) {
    super(props)

    this.activeElem = null
  }
  setActive(elem, item, currentPath) {
    if (!elem) {
      return
    }
    if (!currentPath.match(item.pagePath)) {
      return
    }
    if (this.activeElem) {
      this.activeElem.style.left = `${elem.offsetLeft}px`
      this.activeElem.innerHTML = item.title
    }
  }
  render() {
    const { location, menu, useHash } = this.props
    let biblio = location.pathname === '/about/bibliography' ? true : false
    const currentPath = useHash
      ? `/${location.hash.replace('#', '')}`
      : location.pathname
    const link = nextPagePath => {
      const nextPath = currentPath.replace(/\/about\/.+/, nextPagePath)
      return {
        pathname: useHash ? location.pathname : nextPath,
        hash: useHash ? nextPath.substr(1) : biblio ? '' : location.hash,
      }
    }

    return (
      <div className={styles.subnav}>
        <div
          className={styles.active}
          ref={e => {
            this.activeElem = e
          }}
        />
        <ul>
          {menu.map((item, idx) => (
            <li key={idx} ref={e => this.setActive(e, item, currentPath)}>
              <Link to={link(item.pagePath)}>
                <span dangerouslySetInnerHTML={{ __html: item.title }} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

export default withRouter(Subnav)
