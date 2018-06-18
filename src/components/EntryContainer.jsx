import React from 'react';
import { connect } from 'react-redux';
import Entry from './Entry';

const EntryContainer = ({ ...props }) => <Entry {...props} />;

export default connect(state => ({
  idLinksAreActive: state.app.idLinksAreActive
}))(EntryContainer);
