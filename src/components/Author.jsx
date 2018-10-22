import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class Author extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldShowSources: false
    }
  }
  render() {
    const { firstName, lastName, id } = this.props.author;
    const sources = this.props.sources;
    const { shouldShowSources } = this.state;

    const authorsSources = (srcs) => {
      const authorsSourceList = Object.entries(srcs).filter(([sourceId, source]) => source.author === id).map(([souorceId, source]) => source);
      return (
        <ul>
          { authorsSourceList.map(source => {
            return (<li key={`${id}${source.id}`}><Link to={`/source/${source.id}`}>{source.title}</Link></li>)
          }) }
        </ul>
      )
    }

    return (<li
      onClick={() => this.setState({shouldShowSources: !this.state.shouldShowSources})}
    >
    {`${firstName} ${lastName}`}
    {shouldShowSources ? authorsSources(sources) : ''}
    </li>);
  }
}

export default withRouter(
  connect(state => ({ sources: state.app.biblio }))(Author)
);
