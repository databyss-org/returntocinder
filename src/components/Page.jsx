import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { withRouter } from 'react-router-dom'
import Subnav from './Subnav.jsx'
import styles from '../app.scss'
import actions from '../redux/app/actions'
import withLoader from '../hoc/withLoader'

class Page extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      authorColumnHeight: '0px',
    }
    this.handleClick = this.handleClick.bind(this)
    this.topRef = React.createRef()
    this.columnHeightRef = React.createRef()
  }

  componentDidMount() {
    this.calculateColumnHeight()

    if (this.props.history.location.hash) {
      setTimeout(() => this.scrollToAnchor(), 0)
    }
    this.backListener = this.props.history.listen(() => {
      if (
        this.props.history.action === 'PUSH' ||
        this.props.history.action === 'POP'
      ) {
        const hash = this.props.history.location.hash
        if (hash) {
          this.authorNameScroll(hash.slice(1))
        } else {
          if (this.props.history.location.pathname === '/about/bibliography') {
            this.topRef.current.scrollIntoView()
          }
        }
      }
    })

    document.addEventListener('click', this.handleClick)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path === '/about/bibliography') {
      this.calculateColumnHeight()
    }
  }

  componentWillUnmount() {
    this.backListener()
    document.removeEventListener('click', this.handleClick)
  }

  handleClick(e) {
    //This handler checks to see whether a biblio link was checked
    const targetLink = e.target.closest('a')
    if (targetLink) {
      if (!targetLink.getAttribute('href')) {
        e.preventDefault()
      } else {
        if (
          targetLink &&
          !targetLink.getAttribute('href').match(/^(http|https)/)
        ) {
          e.preventDefault()
          let url = targetLink.getAttribute('href').split('#')[0]
          if (url.split('/')[1] === 'source') {
            this.props.history.push({ pathname: url })
          }
        }
      }
    }
  }

  scrollToAnchor() {
    let { pathname, hash } = this.props.history.location
    if (pathname == '/about/bibliography' && hash) {
      this.authorNameScroll(hash.slice(1))
    }
  }

  authorNameScroll(id) {
    let el = document.getElementById(id)
    if (el) {
      el.scrollIntoView()
    }
  }

  authorNameClick(id) {
    this.props.history.push({ pathname: '/about/bibliography', hash: id })
  }

  calculateColumnHeight() {
    // calculates the height needed for flexbox to create two columns
    let margin = 0
    let offsetHeight = 0
    if (this.columnHeightRef.current) {
      const style = window.getComputedStyle(this.columnHeightRef.current)
      margin = parseInt(style.getPropertyValue('margin').replace('px', ''))
      offsetHeight = this.columnHeightRef.current
        ? this.columnHeightRef.current.offsetHeight
        : 0
      offsetHeight = offsetHeight + 2 * margin
    }
    let height =
      Math.ceil(this.props.appState.authorList.length / 2) * offsetHeight
    this.setState({ authorColumnHeight: height })
  }

  render() {
    let { subnavPath, content, menu, useHash, appState } = this.props
    let { authorList } = appState
    const authorListHeader = authorList.map((a, i) => (
      <a
        ref={this.columnHeightRef}
        className={styles.authorContent}
        key={i}
        onClick={() => this.authorNameClick(a.id)}
      >
        {a.lastName}
        {a.firstName && `, ${a.firstName}`}
      </a>
    ))

    return (
      <div className={styles.about}>
        <div className={styles.container}>
          <div className={styles.head}>
            <Subnav menu={menu} basePath={subnavPath} useHash={useHash} />
          </div>
          <header>{content.title}</header>
          <div className={styles.body} id='about'>
            <div ref={this.topRef} />
            {content.title === 'bibliography' && (
              <div className={styles.authorContainer}>
                <div className={styles.authorTitle}>
                  <h1>Authors</h1>
                </div>
                <br />
                <div
                  style={{ height: this.state.authorColumnHeight }}
                  className={styles.authorListContainer}
                >
                  {authorListHeader}
                </div>
              </div>
            )}

            {content.body.map((para, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
            {content.footnotes && (
              <div className={styles.footnotes}>
                <ol>
                  {content.footnotes.map((note, idx) => (
                    <li key={idx}>
                      {idx + 1}.&nbsp;
                      {note.map((para, idx2) => (
                        <p
                          key={idx2}
                          dangerouslySetInnerHTML={{
                            __html: para,
                          }}
                        />
                      ))}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(
  compose(
    connect(
      state => ({
        appState: state.app,
      }),
      actions
    ),
    withLoader({
      propsToLoad: props => ({
        content: props.contentFunc
          ? props.contentFunc(props)
          : props.appState.pages[props.path],
        menu: props.appState.menus[props.subnavPath],
      }),
      loaderActions: props => ({
        content: () => props.fetchPage(props.path),
        menu: () => props.fetchMenu(props.subnavPath),
      }),
      showLoader: true,
    })
  )(Page)
)
