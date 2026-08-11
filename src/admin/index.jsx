import React from 'react';
import { render } from 'react-dom';
import 'reset-css/reset.css';
import './admin.scss';
import { BrowserRouter as Router, Route, NavLink, Redirect } from 'react-router-dom';
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
const ADMIN_DARK_MODE_KEY = 'r2c.admin.darkMode';

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

function loadDarkMode() {
  const saved = localStorage.getItem(ADMIN_DARK_MODE_KEY);
  if (saved === null) {
    return true;
  }
  return saved === '1';
}

function saveDarkMode(enabled) {
  localStorage.setItem(ADMIN_DARK_MODE_KEY, enabled ? '1' : '0');
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
      expiresAt: session ? session.expiresAt : 0,
      darkMode: loadDarkMode()
    };
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onToggleDarkMode = this.onToggleDarkMode.bind(this);
    this.syncBodyDarkMode = this.syncBodyDarkMode.bind(this);
  }

  componentDidMount() {
    this.syncBodyDarkMode(this.state.darkMode);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.darkMode !== this.state.darkMode) {
      this.syncBodyDarkMode(this.state.darkMode);
    }
  }

  componentWillUnmount() {
    this.syncBodyDarkMode(false);
  }

  syncBodyDarkMode(enabled) {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.classList.toggle('admin-dark', enabled);
  }

  onToggleDarkMode() {
    this.setState((state) => {
      const darkMode = !state.darkMode;
      saveDarkMode(darkMode);
      return { darkMode };
    });
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
    const darkMode = this.state.darkMode;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: darkMode ? '#121212' : '#f7f7f7',
          color: darkMode ? '#f0f0f0' : '#111'
        }}
      >
        <form
          onSubmit={this.onLogin}
          style={{
            width: 360,
            backgroundColor: darkMode ? '#1f1f1f' : '#fff',
            border: darkMode ? '1px solid #444' : '1px solid #ddd',
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
              border: darkMode ? '1px solid #555' : '1px solid #ccc',
              backgroundColor: darkMode ? '#2a2a2a' : '#fff',
              color: darkMode ? '#f0f0f0' : '#111',
              borderRadius: 4,
              marginBottom: 12
            }}
            required
          />
          {this.state.error && (
            <div style={{ color: '#a22', marginBottom: 12 }}>{this.state.error}</div>
          )}
          <button
            onClick={this.onToggleDarkMode}
            type="button"
            style={{
              width: '100%',
              marginTop: 8,
              padding: '8px 12px',
              borderRadius: 4,
              border: darkMode ? '1px solid #666' : '1px solid #aaa',
              backgroundColor: darkMode ? '#2a2a2a' : '#fff',
              color: darkMode ? '#f0f0f0' : '#111'
            }}
          >
            {darkMode ? 'Use Light Mode' : 'Use Dark Mode'}
          </button>
          <button
            type="submit"
            style={{
              width: '100%',
              marginTop: 8,
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

    const darkMode = this.state.darkMode;

    return (
      <Router>
        <div
          className={darkMode ? 'admin-shell admin-dark' : 'admin-shell'}
          style={{ minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#fff', color: darkMode ? '#f0f0f0' : '#111' }}
        >
          <div className="admin-layout">
            <Navbar inverse={darkMode} className="admin-sidebar-nav">
              <Navbar.Header>
                <Navbar.Brand>Admin</Navbar.Brand>
              </Navbar.Header>
              <div className="admin-sidebar-nav-groups">
                <ul className="nav navbar-nav admin-sidebar-main-nav">
                  <li>
                    <NavLink to="/admin/supplement" className="admin-sidebar-route-link" activeClassName="admin-sidebar-link-active">
                      Upload Supplement
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/db" className="admin-sidebar-route-link" activeClassName="admin-sidebar-link-active">
                      Database Actions
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/entries" className="admin-sidebar-route-link" activeClassName="admin-sidebar-link-active">
                      Entries
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/sources" className="admin-sidebar-route-link" activeClassName="admin-sidebar-link-active">
                      Sources
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/authors" className="admin-sidebar-route-link" activeClassName="admin-sidebar-link-active">
                      Authors
                    </NavLink>
                  </li>
                </ul>
                <Nav className="admin-sidebar-footer-nav">
                  <NavItem onClick={this.onToggleDarkMode}>
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </NavItem>
                  <NavItem onClick={this.onLogout}>Logout</NavItem>
                </Nav>
              </div>
            </Navbar>
            <div className="admin-main-content">
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
        </div>
      </Router>
    );
  }

  render() {
    return this.state.token ? this.renderAdmin() : this.renderLogin();
  }
}

render(<App />, document.getElementById('root'));
