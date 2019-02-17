import React from 'react';
import { render } from 'react-dom';
import 'reset-css/reset.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import UploadRtf from './UploadRtf';
import DbActions from './DbActions';
import MotifLinks from './MotifLinks';

const App = () => (
  <Router>
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>Databyss Admin</Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavItem>
            <Link to="/admin/supplement">Upload Supplement</Link>
          </NavItem>
          <NavItem>
            <Link to="/admin/db">Database Actions</Link>
          </NavItem>
        </Nav>
      </Navbar>
      <div style={{ padding: '20px' }}>
        <Route path="/admin/supplement" component={UploadRtf} />
        <Route path="/admin/db" component={DbActions} />
        <Route path="/admin/motiflinks" component={MotifLinks} />
      </div>
    </div>
  </Router>
);

render(<App />, document.getElementById('root'));
