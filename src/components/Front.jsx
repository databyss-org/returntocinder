/* eslint-disable arrow-body-style */
import React from "react";
import { Link, withRouter, matchPath, Route } from "react-router-dom";
import { connect } from "react-redux";
import cx from "classnames";
import styles from "../app.scss";
import Authors from "./Authors";
import Motifs from "./Motifs";
import actions from "../redux/app/actions";

class Front extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: "Motifs" // "Motifs" || "Authors"
    };
    this.showMotifs = this.showMotifs.bind(this);
    this.showAuthors = this.showAuthors.bind(this);
  }

  showMotifs() {
    this.state.show !== "Motifs" ? this.setState({ show: "Motifs" }) : "";
  }

  showAuthors() {
    this.state.show !== "Authors" ? this.setState({ show: "Authors" }) : "";
  }

  render() {
    const { location, toggleSearchIsFocused, app } = this.props;
    return (
      <div
        className={cx(styles.front, {
          [styles.showFull]: Boolean(
            matchPath(location.pathname, { path: "/", exact: true })
          )
        })}
      >
        <div className={cx(styles.container, styles.withMotifs)}>
          <div className={styles.head}>
            <div className={styles.title}>{app.pages["/"].title}</div>
            <p>
              <span dangerouslySetInnerHTML={{ __html: app.pages["/"].body }} />
              &nbsp;
              <Link to="/about/frontis">&hellip;</Link>
            </p>
            <div className={styles.toggles}>
              <a onClick={this.showMotifs}>Motifs</a>
              <a onClick={this.showAuthors}>Authors</a>
            </div>
          </div>
          <div className={cx(styles.body, styles.show)}>
            {this.state.show === "Motifs" ? <Motifs /> : <Authors />}
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(
    state => state,
    actions
  )(Front)
);
