import React from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import styles from '../app.scss'

class Author extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      shouldShowSources: false,
      sortedSources: null,
    }
  }
  render() {
    const { firstName, lastName, id } = this.props.author
    const sources = this.props.sources
    const { shouldShowSources } = this.state

    const sortAuthorSources = srcs =>
      Object.values(srcs)
        .filter(source => source.author === id)
        .sort((s1, s2) => {
          const src1 = s1.title.toLowerCase()
          const src2 = s2.title.toLowerCase()
          if (src1 < src2) {
            return -1
          }
          if (src1 > src2) {
            return 1
          }
          return 0
        })

    const getSortedAuthorSources = srcs => {
      if (this.state.sortedSources !== null) {
        return this.state.sortedSources
      }
      const sortedSources = sortAuthorSources(srcs)
      this.setState({ sortedSources })
      return sortedSources
    }

    const renderAuthorsSources = srcs => {
      const authorsSourceList = getSortedAuthorSources(srcs)
      return (
        <ul>
          {authorsSourceList.map(source => (
            <li className={styles.sublist} key={`${id}${source.id}`}>
              <Link
                to={`/source/${source.id}`}
                dangerouslySetInnerHTML={{ __html: source.title }}
              />
            </li>
          ))}
        </ul>
      )
    }

    return (
      <li
        onClick={() =>
          this.setState({ shouldShowSources: !this.state.shouldShowSources })
        }
      >
        {`${firstName} ${lastName}`}
        {shouldShowSources ? renderAuthorsSources(sources) : ''}
      </li>
    )
  }
}

export default withRouter(
  connect(state => ({ sources: state.app.biblio }))(Author)
)
