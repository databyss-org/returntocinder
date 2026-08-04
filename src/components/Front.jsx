/* eslint-disable arrow-body-style */
import React from 'react'
import { Link, withRouter, matchPath, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import cx from 'classnames'
import styles from '../app.scss'
import Authors from './Authors'
import Motifs from './Motifs'
import actions from '../redux/app/actions'

class Front extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      show: 'Motifs', // 'Motifs' || 'Authors'
    }
    this.showMotifs = this.showMotifs.bind(this)
    this.showAuthors = this.showAuthors.bind(this)
  }

  showMotifs() {
    this.state.show !== 'Motifs' ? this.setState({ show: 'Motifs' }) : ''
  }

  showAuthors() {
    this.state.show !== 'Authors' ? this.setState({ show: 'Authors' }) : ''
  }

  render() {
    const { location, toggleSearchIsFocused, app } = this.props
    return (
      <div
        className={cx(styles.front, {
          [styles.showFull]: Boolean(
            matchPath(location.pathname, { path: '/', exact: true }),
          ),
        })}
      >
        <div className={cx(styles.container, styles.withMotifs)}>
          <div className={styles.head}>
            <h1 className={styles.title}>{app.pages['/'].title}</h1>
            <p>
              <span dangerouslySetInnerHTML={{ __html: app.pages['/'].body }} />
            </p>
          </div>
          <div
            className={cx(styles.body, styles.show, {
              [styles.showAuthors]: this.state.show !== 'Motifs',
            })}
          >
            <div className={styles.columnHead}>
              <div className={styles.columnTitle}>{this.state.show}</div>
              <a
                className={styles.columnToggleLink}
                onClick={
                  this.state.show === 'Motifs'
                    ? this.showAuthors
                    : this.showMotifs
                }
              >
                {this.state.show === 'Motifs' ? 'Authors ››' : '‹‹ Motifs'}
              </a>
            </div>
            <div className={styles.bodyViewport}>
              <div className={styles.bodyTrack}>
                <div className={styles.bodyPane}>
                  <Motifs />
                </div>
                <div className={styles.bodyPane}>
                  <Authors />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default withRouter(connect((state) => state, actions)(Front))
