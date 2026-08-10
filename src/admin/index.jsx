import React from 'react';
import { render } from 'react-dom';
import 'reset-css/reset.css';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import UploadRtf from './UploadRtf';
import DbActions from './DbActions';
import EntriesCrud from './EntriesCrud';
import SourcesCrud from './SourcesCrud';
import AuthorsCrud from './AuthorsCrud';

const { API_URL } = process.env;
const ADMIN_TOKEN_KEY = 'r2c.admin.token';
const ADMIN_TOKEN_EXP_KEY = 'r2c.admin.tokenExp';

function loadSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(ADMIN_TOKEN_EXP_KEY) || 0);
  if (!token || !expiresAt || Date.now() >= expiresAt) {
    return null;
  }
  return { token, expiresAt };
}

function saveSession(token, expiresAt) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_TOKEN_EXP_KEY, String(expiresAt));
}

function clearSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_EXP_KEY);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    const session = loadSession();
    this.state = {
      password: '',
      loading: false,
      error: '',
      token: session ? session.token : null,
      expiresAt: session ? session.expiresAt : 0
    };
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
  }

  onPasswordChanged(evt) {
    this.setState({ password: evt.target.value });
  }

  async onLogin(evt) {
    evt.preventDefault();

    this.setState({ loading: true, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      const response = await axios.post(`${baseUrl}/admin/login`, {
        password: this.state.password
      });
      const { token, expiresAt } = response.data;
      saveSession(token, expiresAt);
      this.setState({
        token,
        expiresAt,
        password: '',
        loading: false,
        error: ''
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: 'Login failed. Check your password and admin server configuration.'
      });
    }
  }

  onLogout() {
    clearSession();
    this.setState({
      token: null,
      expiresAt: 0,
      password: '',
      error: ''
    });
  }

  renderLogin() {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f7f7f7'
        }}
      >
        <form
          onSubmit={this.onLogin}
          style={{
            width: 360,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: 4,
            padding: 24,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Admin</h2>
          <label htmlFor="adminPassword" style={{ display: 'block', marginBottom: 8 }}>
            Password
          </label>
          <input
            id="adminPassword"
            type="password"
            value={this.state.password}
            onChange={this.onPasswordChanged}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ccc',
              borderRadius: 4,
              marginBottom: 12
            }}
            required
          />
          {this.state.error && (
            <div style={{ color: '#a22', marginBottom: 12 }}>{this.state.error}</div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: '#111',
              color: '#fff'
            }}
            disabled={this.state.loading}
          >
            {this.state.loading ? 'Checking...' : 'Enter Admin'}
          </button>
        </form>
      </div>
    );
  }

  renderAdmin() {
    if (Date.now() >= this.state.expiresAt) {
      this.onLogout();
      return this.renderLogin();
    }

    return (
      <Router>
        <div>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>Admin</Navbar.Brand>
            </Navbar.Header>
            <Nav>
              <NavItem>
                <Link to="/admin/supplement">Upload Supplement</Link>
              </NavItem>
              <NavItem>
                <Link to="/admin/db">Database Actions</Link>
              </NavItem>
              <NavItem>
                <Link to="/admin/entries">Entries</Link>
              </NavItem>
              <NavItem>
                <Link to="/admin/sources">Sources</Link>
              </NavItem>
              <NavItem>
                <Link to="/admin/authors">Authors</Link>
              </NavItem>
              <NavItem onClick={this.onLogout}>Logout</NavItem>
            </Nav>
          </Navbar>
          <div style={{ padding: '20px' }}>
            <Route exact path="/admin" render={() => <Redirect to="/admin/supplement" />} />
            <Route
              path="/admin/supplement"
              render={(props) => (
                <UploadRtf
                  {...props}
                  adminToken={this.state.token}
                />
              )}
            />
            <Route
              path="/admin/db"
              render={(props) => (
                <DbActions
                  {...props}
                  adminToken={this.state.token}
                />
              )}
            />
            <Route
              path="/admin/entries"
              render={(props) => (
                <EntriesCrud
                  {...props}
                  adminToken={this.state.token}
                />
              )}
            />
            <Route
              path="/admin/sources"
              render={(props) => (
                <SourcesCrud
                  {...props}
                  adminToken={this.state.token}
                />
              )}
            />
            <Route
              path="/admin/authors"
              render={(props) => (
                <AuthorsCrud
                  {...props}
                  adminToken={this.state.token}
                />
              )}
            />
          </div>
        </div>
      </Router>
    );
  }

  render() {
    return this.state.token ? this.renderAdmin() : this.renderLogin();
  }
}

render(<App />, document.getElementById('root'));
