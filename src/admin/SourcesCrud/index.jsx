import React from 'react';
import axios from 'axios';
import { Button, FormControl, FormGroup, ControlLabel, Panel, Table, Modal, Tabs, Tab } from 'react-bootstrap';

const { API_URL } = process.env;

const defaultForm = {
  id: '',
  title: '',
  author: '',
  citations: '',
};

function toHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function citationsToText(citations) {
  if (!Array.isArray(citations)) {
    return '';
  }
  return citations.join('\n');
}

class SourcesCrud extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'sources',
      loading: true,
      saving: false,
      deletingId: null,
      showDeleteModal: false,
      deleteTargetId: '',
      deleteConfirmInput: '',
      error: '',
      sources: [],
      sourceSearch: '',
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
    this.onSourceSearchChange = this.onSourceSearchChange.bind(this);
    this.onTabSelect = this.onTabSelect.bind(this);
    this.loadSources = this.loadSources.bind(this);
  }

  componentDidMount() {
    this.loadSources();
  }

  async loadSources() {
    this.setState({ loading: true, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      const response = await axios.get(`${baseUrl}/admin/sources`, {
        headers: toHeaders(this.props.adminToken),
      });
      this.setState({
        loading: false,
        sources: response.data,
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: 'Could not load sources.',
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

  onEdit(source) {
    this.setState({
      activeTab: 'form',
      editingId: source.id,
      form: {
        id: source.id,
        title: source.title || source.name || '',
        author: source.author || '',
        citations: citationsToText(source.citations),
      },
      error: '',
    });
  }

  onCancelEdit() {
    this.setState({
      activeTab: 'sources',
      editingId: null,
      form: { ...defaultForm },
      error: '',
    });
  }

  onTabSelect(activeTab) {
    this.setState({ activeTab });
  }

  onSourceSearchChange(evt) {
    this.setState({ sourceSearch: evt.target.value });
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
      await axios.post(`${baseUrl}/admin/sources`, this.state.form, {
        headers: toHeaders(this.props.adminToken),
      });
      await this.loadSources();
      this.setState({
        activeTab: 'sources',
        saving: false,
        form: { ...defaultForm },
      });
    } catch (err) {
      this.setState({
        saving: false,
        error: err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Could not create source.',
      });
    }
  }

  async onUpdate(evt) {
    evt.preventDefault();
    this.setState({ saving: true, error: '' });

    try {
      const baseUrl = API_URL || '/api';
      await axios.put(
        `${baseUrl}/admin/sources/${this.state.editingId}`,
        this.state.form,
        { headers: toHeaders(this.props.adminToken) },
      );
      await this.loadSources();
      this.setState({
        activeTab: 'sources',
        saving: false,
        editingId: null,
        form: { ...defaultForm },
      });
    } catch (err) {
      this.setState({
        saving: false,
        error: err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Could not update source.',
      });
    }
  }

  async onDelete(sourceId) {
    this.setState({
      showDeleteModal: true,
      deleteTargetId: sourceId,
      deleteConfirmInput: '',
      error: '',
    });
  }

  async confirmDelete() {
    const sourceId = this.state.deleteTargetId;
    if (!sourceId || this.state.deleteConfirmInput !== sourceId) {
      return;
    }

    this.setState({ deletingId: sourceId, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      await axios.delete(`${baseUrl}/admin/sources/${sourceId}`, {
        headers: toHeaders(this.props.adminToken),
      });
      await this.loadSources();
      if (this.state.editingId === sourceId) {
        this.onCancelEdit();
      }
      this.setState({ deletingId: null });
      this.onCloseDeleteModal();
    } catch (err) {
      this.setState({
        deletingId: null,
        error: 'Could not delete source.',
      });
    }
  }

  renderForm() {
    const isEditing = !!this.state.editingId;

    return (
      <form onSubmit={isEditing ? this.onUpdate : this.onCreate}>
        <FormGroup>
          <ControlLabel>Source ID</ControlLabel>
          <FormControl
            name="id"
            type="text"
            value={this.state.form.id}
            onChange={this.onChange}
            placeholder="BSi"
            required
            disabled={isEditing}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            name="title"
            type="text"
            value={this.state.form.title}
            onChange={this.onChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Author Code</ControlLabel>
          <FormControl
            name="author"
            type="text"
            value={this.state.form.author}
            onChange={this.onChange}
            placeholder="DD"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Citations (one citation per line)</ControlLabel>
          <FormControl
            name="citations"
            componentClass="textarea"
            rows={4}
            value={this.state.form.citations}
            onChange={this.onChange}
          />
        </FormGroup>
        <Button type="submit" bsStyle="primary" disabled={this.state.saving}>
          {this.state.saving ? 'Saving...' : isEditing ? 'Update Source' : 'Create Source'}
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
    );
  }

  renderSources() {
    if (this.state.loading) {
      return <div>Loading sources...</div>;
    }

    const query = this.state.sourceSearch.trim().toLowerCase();
    if (!query) {
      return <div>Search for a source by ID or title to display results.</div>;
    }

    const filteredSources = this.state.sources.filter((source) => {
      const id = (source.id || '').toLowerCase();
      const title = (source.title || source.name || '').toLowerCase();
      return id.includes(query) || title.includes(query);
    });

    if (!filteredSources.length) {
      return <div>No sources match this search.</div>;
    }

    return (
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Citations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSources.map(source => (
            <tr key={source.id}>
              <td>{source.id}</td>
              <td>{source.title || source.name}</td>
              <td>{source.author || ''}</td>
              <td>{Array.isArray(source.citations) ? source.citations.join(', ') : ''}</td>
              <td>
                <Button bsSize="small" onClick={() => this.onEdit(source)}>
                  Edit
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  bsSize="small"
                  bsStyle="danger"
                  onClick={() => this.onDelete(source.id)}
                  disabled={this.state.deletingId === source.id}
                >
                  {this.state.deletingId === source.id ? 'Deleting...' : 'Delete'}
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
    const formTabTitle = this.state.editingId ? 'Edit Source' : 'Add Source';

    return (
      <div>
        {this.state.error && (
          <div style={{ color: '#a22', marginBottom: 12 }}>{this.state.error}</div>
        )}
        <Tabs
          id="sources-crud-tabs"
          activeKey={this.state.activeTab}
          onSelect={this.onTabSelect}
        >
          <Tab eventKey="sources" title="Sources">
            <Panel style={{ marginTop: 12 }}>
              <Panel.Body>
                <FormGroup>
                  <ControlLabel>Search Sources (ID or title)</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.sourceSearch}
                    onChange={this.onSourceSearchChange}
                    placeholder="e.g. BSi or grammatology"
                  />
                </FormGroup>
                {this.renderSources()}
              </Panel.Body>
            </Panel>
          </Tab>
          <Tab eventKey="form" title={formTabTitle}>
            <Panel style={{ marginTop: 12 }}>
              <Panel.Body>
                {this.renderForm()}
              </Panel.Body>
            </Panel>
          </Tab>
        </Tabs>

        <Modal show={this.state.showDeleteModal} onHide={this.onCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Source Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You are deleting source <strong>{this.state.deleteTargetId}</strong>.
            </p>
            <p style={{ color: '#a22' }}>
              Warning: this is a cascading delete. All entries that reference this source will be deleted.
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
              {this.state.deletingId === this.state.deleteTargetId ? 'Deleting...' : 'Delete Source and Entries'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default SourcesCrud;
