import React from 'react';
import axios from 'axios';
import { Button, FormControl, FormGroup, ControlLabel, Panel, Table, Modal } from 'react-bootstrap';

const { API_URL } = process.env;

const defaultForm = {
  id: '',
  firstName: '',
  lastName: '',
};

function toHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

class AuthorsCrud extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      saving: false,
      deletingId: null,
      showDeleteModal: false,
      deleteTargetId: '',
      deleteConfirmInput: '',
      error: '',
      authors: [],
      authorSearch: '',
      form: { ...defaultForm },
      editingId: null,
    };

    this.onChange = this.onChange.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteConfirmInputChange = this.onDeleteConfirmInputChange.bind(this);
    this.onCloseDeleteModal = this.onCloseDeleteModal.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.onCancelEdit = this.onCancelEdit.bind(this);
    this.onAuthorSearchChange = this.onAuthorSearchChange.bind(this);
    this.loadAuthors = this.loadAuthors.bind(this);
  }

  componentDidMount() {
    this.loadAuthors();
  }

  async loadAuthors() {
    this.setState({ loading: true, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      const response = await axios.get(`${baseUrl}/admin/authors`, {
        headers: toHeaders(this.props.adminToken),
      });
      this.setState({
        loading: false,
        authors: response.data,
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: 'Could not load authors.',
      });
    }
  }

  onChange(evt) {
    this.setState({
      form: {
        ...this.state.form,
        [evt.target.name]: evt.target.value,
      },
    });
  }

  onEdit(author) {
    this.setState({
      editingId: author.id,
      form: {
        id: author.id,
        firstName: author.firstName || '',
        lastName: author.lastName || '',
      },
      error: '',
    });
  }

  onCancelEdit() {
    this.setState({
      editingId: null,
      form: { ...defaultForm },
      error: '',
    });
  }

  onAuthorSearchChange(evt) {
    this.setState({ authorSearch: evt.target.value });
  }

  onDeleteConfirmInputChange(evt) {
    this.setState({ deleteConfirmInput: evt.target.value });
  }

  onCloseDeleteModal() {
    this.setState({
      showDeleteModal: false,
      deleteTargetId: '',
      deleteConfirmInput: '',
    });
  }

  async onCreate(evt) {
    evt.preventDefault();
    this.setState({ saving: true, error: '' });

    try {
      const baseUrl = API_URL || '/api';
      await axios.post(`${baseUrl}/admin/authors`, this.state.form, {
        headers: toHeaders(this.props.adminToken),
      });
      await this.loadAuthors();
      this.setState({
        saving: false,
        form: { ...defaultForm },
      });
    } catch (err) {
      this.setState({
        saving: false,
        error: err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Could not create author.',
      });
    }
  }

  async onUpdate(evt) {
    evt.preventDefault();
    this.setState({ saving: true, error: '' });

    try {
      const baseUrl = API_URL || '/api';
      await axios.put(
        `${baseUrl}/admin/authors/${this.state.editingId}`,
        this.state.form,
        { headers: toHeaders(this.props.adminToken) },
      );
      await this.loadAuthors();
      this.setState({
        saving: false,
        editingId: null,
        form: { ...defaultForm },
      });
    } catch (err) {
      this.setState({
        saving: false,
        error: err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Could not update author.',
      });
    }
  }

  onDelete(authorId) {
    this.setState({
      showDeleteModal: true,
      deleteTargetId: authorId,
      deleteConfirmInput: '',
      error: '',
    });
  }

  async confirmDelete() {
    const authorId = this.state.deleteTargetId;
    if (!authorId || this.state.deleteConfirmInput !== authorId) {
      return;
    }

    this.setState({ deletingId: authorId, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      await axios.delete(`${baseUrl}/admin/authors/${authorId}`, {
        headers: toHeaders(this.props.adminToken),
      });
      await this.loadAuthors();
      if (this.state.editingId === authorId) {
        this.onCancelEdit();
      }
      this.setState({ deletingId: null });
      this.onCloseDeleteModal();
    } catch (err) {
      this.setState({
        deletingId: null,
        error: 'Could not delete author.',
      });
    }
  }

  renderForm() {
    const isEditing = !!this.state.editingId;

    return (
      <Panel>
        <Panel.Heading>{isEditing ? `Edit Author ${this.state.editingId}` : 'Add Author'}</Panel.Heading>
        <Panel.Body>
          <form onSubmit={isEditing ? this.onUpdate : this.onCreate}>
            <FormGroup>
              <ControlLabel>Author ID</ControlLabel>
              <FormControl
                name="id"
                type="text"
                value={this.state.form.id}
                onChange={this.onChange}
                placeholder="DD"
                required
                disabled={isEditing}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>First Name</ControlLabel>
              <FormControl
                name="firstName"
                type="text"
                value={this.state.form.firstName}
                onChange={this.onChange}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Last Name</ControlLabel>
              <FormControl
                name="lastName"
                type="text"
                value={this.state.form.lastName}
                onChange={this.onChange}
                required
              />
            </FormGroup>
            <Button type="submit" bsStyle="primary" disabled={this.state.saving}>
              {this.state.saving ? 'Saving...' : isEditing ? 'Update Author' : 'Create Author'}
            </Button>
            {isEditing && (
              <Button
                style={{ marginLeft: 10 }}
                onClick={this.onCancelEdit}
                disabled={this.state.saving}
              >
                Cancel
              </Button>
            )}
          </form>
        </Panel.Body>
      </Panel>
    );
  }

  renderAuthors() {
    if (this.state.loading) {
      return <div>Loading authors...</div>;
    }

    const query = this.state.authorSearch.trim().toLowerCase();
    if (!query) {
      return <div>Search for an author by ID, first name, or last name to display results.</div>;
    }

    const filteredAuthors = this.state.authors.filter((author) => {
      const id = (author.id || '').toLowerCase();
      const firstName = (author.firstName || '').toLowerCase();
      const lastName = (author.lastName || '').toLowerCase();
      return id.includes(query) || firstName.includes(query) || lastName.includes(query);
    });

    if (!filteredAuthors.length) {
      return <div>No authors match this search.</div>;
    }

    return (
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAuthors.map(author => (
            <tr key={author.id}>
              <td>{author.id}</td>
              <td>{author.firstName || ''}</td>
              <td>{author.lastName || ''}</td>
              <td>
                <Button bsSize="small" onClick={() => this.onEdit(author)}>
                  Edit
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  bsSize="small"
                  bsStyle="danger"
                  onClick={() => this.onDelete(author.id)}
                  disabled={this.state.deletingId === author.id}
                >
                  {this.state.deletingId === author.id ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const canConfirmDelete =
      this.state.deleteTargetId &&
      this.state.deleteConfirmInput === this.state.deleteTargetId;

    return (
      <div>
        {this.state.error && (
          <div style={{ color: '#a22', marginBottom: 12 }}>{this.state.error}</div>
        )}
        {this.renderForm()}
        <Panel>
          <Panel.Heading>Existing Authors</Panel.Heading>
          <Panel.Body>
            <FormGroup>
              <ControlLabel>Search Authors (ID, first name, or last name)</ControlLabel>
              <FormControl
                type="text"
                value={this.state.authorSearch}
                onChange={this.onAuthorSearchChange}
                placeholder="e.g. DD or derrida"
              />
            </FormGroup>
            {this.renderAuthors()}
          </Panel.Body>
        </Panel>

        <Modal show={this.state.showDeleteModal} onHide={this.onCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Author Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You are deleting author <strong>{this.state.deleteTargetId}</strong>.
            </p>
            <p style={{ color: '#a22' }}>
              Warning: author deletion does not rewrite existing entries or motif references automatically.
            </p>
            <FormGroup>
              <ControlLabel>
                Type <strong>{this.state.deleteTargetId}</strong> to confirm
              </ControlLabel>
              <FormControl
                type="text"
                value={this.state.deleteConfirmInput}
                onChange={this.onDeleteConfirmInputChange}
                placeholder={this.state.deleteTargetId}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.onCloseDeleteModal}>Cancel</Button>
            <Button
              bsStyle="danger"
              onClick={this.confirmDelete}
              disabled={!canConfirmDelete || this.state.deletingId === this.state.deleteTargetId}
            >
              {this.state.deletingId === this.state.deleteTargetId ? 'Deleting...' : 'Delete Author'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default AuthorsCrud;
