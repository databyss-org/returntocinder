import React from 'react';
import axios from 'axios';
import { Button, FormControl, FormGroup, ControlLabel, Panel, Table, Modal, Tabs, Tab } from 'react-bootstrap';

const { API_URL } = process.env;

function toHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function normalizeText(value) {
  return `${value || ''}`.toLowerCase();
}

function matchesQuery(entry, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }

  const haystacks = [
    entry._id,
    entry.id,
    entry.content,
    entry.source && entry.source.id,
    entry.source && entry.source.name,
    entry.source && entry.source.display,
    entry.locations && entry.locations.raw,
  ];

  return haystacks.some((value) => normalizeText(value).includes(normalizedQuery));
}

class EntriesCrud extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'source',
      sources: [],
      sourceSearch: '',
      selectedSourceId: '',
      selectedSourceTitle: '',
      query: '',
      loadingSources: true,
      loadingEntries: false,
      savingEntry: false,
      editingEntryId: null,
      deletingId: null,
      error: '',
      entries: [],
      entryForm: {
        id: '',
        content: '',
        locationRaw: '',
        starred: false,
      },
      showDeleteModal: false,
      deleteTargetId: '',
      deleteConfirmInput: '',
    };

    this.onSourceSearchChange = this.onSourceSearchChange.bind(this);
    this.onTabSelect = this.onTabSelect.bind(this);
    this.onSelectSource = this.onSelectSource.bind(this);
    this.onClearSource = this.onClearSource.bind(this);
    this.onOpenAddEntry = this.onOpenAddEntry.bind(this);
    this.onCancelEntryEdit = this.onCancelEntryEdit.bind(this);
    this.onEditEntry = this.onEditEntry.bind(this);
    this.onEntryFieldChange = this.onEntryFieldChange.bind(this);
    this.onEntryStarredChange = this.onEntryStarredChange.bind(this);
    this.onSaveEntry = this.onSaveEntry.bind(this);
    this.onQueryChange = this.onQueryChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteConfirmInputChange = this.onDeleteConfirmInputChange.bind(this);
    this.onCloseDeleteModal = this.onCloseDeleteModal.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.loadSources = this.loadSources.bind(this);
    this.loadEntries = this.loadEntries.bind(this);
  }

  componentDidMount() {
    this.loadSources();
  }

  async loadSources() {
    this.setState({ loadingSources: true, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      const response = await axios.get(`${baseUrl}/admin/sources`, {
        headers: toHeaders(this.props.adminToken),
      });
      this.setState({
        loadingSources: false,
        sources: response.data,
      });
    } catch (err) {
      this.setState({
        loadingSources: false,
        error: 'Could not load sources.',
      });
    }
  }

  async loadEntries(sourceId) {
    if (!sourceId) {
      this.setState({ entries: [], loadingEntries: false });
      return;
    }

    this.setState({ loadingEntries: true, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      const response = await axios.get(`${baseUrl}/admin/entries`, {
        headers: toHeaders(this.props.adminToken),
        params: { sourceId },
      });
      this.setState({
        loadingEntries: false,
        entries: response.data,
      });
    } catch (err) {
      this.setState({
        loadingEntries: false,
        error: 'Could not load entries for that source.',
      });
    }
  }

  onSourceSearchChange(evt) {
    this.setState({ sourceSearch: evt.target.value });
  }

  onTabSelect(activeTab) {
    this.setState({ activeTab });
  }

  onSelectSource(source) {
    const selectedSourceId = source.id;
    this.setState({
      activeTab: 'entries',
      selectedSourceId,
      selectedSourceTitle: source.title || source.name || '',
      query: '',
      entries: [],
      editingEntryId: null,
      entryForm: {
        id: '',
        content: '',
        locationRaw: '',
        starred: false,
      },
      error: '',
    });
    this.loadEntries(selectedSourceId);
  }

  onClearSource() {
    this.setState({
      activeTab: 'source',
      sourceSearch: '',
      selectedSourceId: '',
      selectedSourceTitle: '',
      query: '',
      entries: [],
      editingEntryId: null,
      entryForm: {
        id: '',
        content: '',
        locationRaw: '',
        starred: false,
      },
      error: '',
    });
  }

  onOpenAddEntry() {
    this.setState({
      activeTab: 'entryForm',
      editingEntryId: null,
      entryForm: {
        id: '',
        content: '',
        locationRaw: '',
        starred: false,
      },
      error: '',
    });
  }

  onCancelEntryEdit() {
    this.setState({
      activeTab: 'entries',
      editingEntryId: null,
      entryForm: {
        id: '',
        content: '',
        locationRaw: '',
        starred: false,
      },
      error: '',
    });
  }

  onEditEntry(entry) {
    this.setState({
      activeTab: 'entryForm',
      editingEntryId: entry._id,
      entryForm: {
        id: entry.id || '',
        content: entry.content || '',
        locationRaw: (entry.locations && entry.locations.raw) || '',
        starred: !!entry.starred,
      },
      error: '',
    });
  }

  onEntryFieldChange(evt) {
    const { name, value } = evt.target;
    this.setState((state) => ({
      entryForm: {
        ...state.entryForm,
        [name]: value,
      },
    }));
  }

  onEntryStarredChange(evt) {
    const { checked } = evt.target;
    this.setState((state) => ({
      entryForm: {
        ...state.entryForm,
        starred: checked,
      },
    }));
  }

  async onSaveEntry(evt) {
    evt.preventDefault();
    if (!this.state.selectedSourceId) {
      this.setState({ error: 'Select a source before saving an entry.' });
      return;
    }

    this.setState({ savingEntry: true, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      const payload = {
        sourceId: this.state.selectedSourceId,
        id: this.state.entryForm.id,
        content: this.state.entryForm.content,
        locationRaw: this.state.entryForm.locationRaw,
        starred: this.state.entryForm.starred,
      };

      let savedEntry;
      if (this.state.editingEntryId) {
        const response = await axios.put(
          `${baseUrl}/admin/entries/${this.state.editingEntryId}`,
          payload,
          { headers: toHeaders(this.props.adminToken) },
        );
        savedEntry = response.data;
      } else {
        const response = await axios.post(
          `${baseUrl}/admin/entries`,
          payload,
          { headers: toHeaders(this.props.adminToken) },
        );
        savedEntry = response.data;
      }

      await this.loadEntries(this.state.selectedSourceId);
      this.setState({
        activeTab: 'entries',
        savingEntry: false,
        editingEntryId: null,
        entryForm: {
          id: '',
          content: '',
          locationRaw: '',
          starred: false,
        },
      });
      return savedEntry;
    } catch (err) {
      this.setState({
        savingEntry: false,
        error: err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Could not save entry.',
      });
      return null;
    }
  }

  onQueryChange(evt) {
    this.setState({ query: evt.target.value });
  }

  onDelete(entry) {
    this.setState({
      showDeleteModal: true,
      deleteTargetId: entry._id,
      deleteConfirmInput: '',
      error: '',
    });
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

  async confirmDelete() {
    const entryId = this.state.deleteTargetId;
    if (!entryId || this.state.deleteConfirmInput !== entryId) {
      return;
    }

    this.setState({ deletingId: entryId, error: '' });
    try {
      const baseUrl = API_URL || '/api';
      await axios.delete(`${baseUrl}/admin/entries/${entryId}`, {
        headers: toHeaders(this.props.adminToken),
      });
      this.setState((state) => ({
        deletingId: null,
        entries: state.entries.filter((entry) => entry._id !== entryId),
      }));
      this.onCloseDeleteModal();
    } catch (err) {
      this.setState({
        deletingId: null,
        error: 'Could not delete entry.',
      });
    }
  }

  renderResults() {
    if (this.state.loadingEntries) {
      return <div>Loading entries for source...</div>;
    }

    if (!this.state.selectedSourceId) {
      return <div>Select a source to load its entries.</div>;
    }

    const filteredResults = this.state.entries.filter((entry) => matchesQuery(entry, this.state.query));

    if (!filteredResults.length) {
      return <div>No entries matched this search.</div>;
    }

    return (
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            <th>Entry ID</th>
            <th>Source</th>
            <th>Locations</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((entry) => (
            <tr key={entry._id}>
              <td style={{ maxWidth: 200, wordBreak: 'break-all' }}>{entry._id}</td>
              <td>
                <div>{entry.source && entry.source.id}</div>
                <div style={{ color: '#666' }}>{entry.source && entry.source.name}</div>
              </td>
              <td>{entry.locations && entry.locations.raw}</td>
              <td style={{ maxWidth: 420 }}>{entry.content}</td>
              <td>
                <Button
                  bsSize="small"
                  onClick={() => this.onEditEntry(entry)}
                >
                  Edit
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  bsSize="small"
                  bsStyle="danger"
                  onClick={() => this.onDelete(entry)}
                  disabled={this.state.deletingId === entry._id}
                >
                  {this.state.deletingId === entry._id ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  renderEntryForm() {
    const isEditing = !!this.state.editingEntryId;

    return (
      <form onSubmit={this.onSaveEntry}>
        <FormGroup>
          <ControlLabel>Source</ControlLabel>
          <FormControl
            type="text"
            value={`${this.state.selectedSourceId} ${this.state.selectedSourceTitle}`.trim()}
            disabled
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Entry ID</ControlLabel>
          <FormControl
            name="id"
            type="text"
            value={this.state.entryForm.id}
            readOnly
            placeholder="will be autogenerated"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Location Raw</ControlLabel>
          <FormControl
            name="locationRaw"
            type="text"
            value={this.state.entryForm.locationRaw}
            onChange={this.onEntryFieldChange}
            placeholder="e.g. pp. 12-14"
            required
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <FormControl
            name="content"
            componentClass="textarea"
            rows={6}
            value={this.state.entryForm.content}
            onChange={this.onEntryFieldChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <label>
            <input
              type="checkbox"
              checked={this.state.entryForm.starred}
              onChange={this.onEntryStarredChange}
            />
            {' '}Starred Entry
          </label>
        </FormGroup>
        <Button type="submit" bsStyle="primary" disabled={this.state.savingEntry}>
          {this.state.savingEntry ? 'Saving...' : isEditing ? 'Update Entry' : 'Create Entry'}
        </Button>
        <Button
          style={{ marginLeft: 10 }}
          onClick={this.onCancelEntryEdit}
          disabled={this.state.savingEntry}
        >
          Cancel
        </Button>
      </form>
    );
  }

  renderSourceStep() {
    if (this.state.loadingSources) {
      return <div>Loading sources...</div>;
    }

    const query = this.state.sourceSearch.trim().toLowerCase();
    if (!query) {
      return <div>Search for a source by ID or title, then choose it.</div>;
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSources.map((source) => (
            <tr key={source.id}>
              <td>{source.id}</td>
              <td>{source.title || source.name || ''}</td>
              <td>{source.author || ''}</td>
              <td>
                <Button
                  bsStyle="primary"
                  bsSize="small"
                  onClick={() => this.onSelectSource(source)}
                >
                  Choose Source
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
    const filteredEntries = this.state.entries.filter((entry) => matchesQuery(entry, this.state.query));

    return (
      <div>
        {this.state.error && (
          <div style={{ color: '#a22', marginBottom: 12 }}>{this.state.error}</div>
        )}

        <Tabs
          id="entries-crud-steps"
          activeKey={this.state.activeTab}
          onSelect={this.onTabSelect}
        >
          <Tab eventKey="source" title="Choose Source">
            <Panel style={{ marginTop: 12 }}>
              <Panel.Body>
                {this.state.selectedSourceId ? (
                  <div>
                    <strong>Selected source:</strong> {this.state.selectedSourceId} {this.state.selectedSourceTitle}
                    <Button
                      style={{ marginLeft: 10 }}
                      bsSize="xsmall"
                      onClick={this.onClearSource}
                    >
                      Reset Source Search
                    </Button>
                  </div>
                ) : (
                  <React.Fragment>
                    <FormGroup>
                      <ControlLabel>Search Sources (ID or title)</ControlLabel>
                      <FormControl
                        type="text"
                        value={this.state.sourceSearch}
                        onChange={this.onSourceSearchChange}
                        placeholder="e.g. AYPOK or grammatology"
                      />
                    </FormGroup>
                    {this.renderSourceStep()}
                  </React.Fragment>
                )}
              </Panel.Body>
            </Panel>
          </Tab>

          <Tab eventKey="entries" title="Edit Entries" disabled={!this.state.selectedSourceId}>
            <Panel style={{ marginTop: 12 }}>
              <Panel.Body>
                {this.state.selectedSourceId ? (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Source:</strong> {this.state.selectedSourceId} {this.state.selectedSourceTitle}
                    <Button
                      style={{ marginLeft: 10 }}
                      bsSize="xsmall"
                      bsStyle="primary"
                      onClick={this.onOpenAddEntry}
                    >
                      Add Entry
                    </Button>
                  </div>
                ) : null}
                <FormGroup>
                  <ControlLabel>Filter entries</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.query}
                    onChange={this.onQueryChange}
                    placeholder="Filter by string in content, source, or id"
                    disabled={!this.state.selectedSourceId}
                  />
                </FormGroup>
                {this.state.selectedSourceId && (
                  <div style={{ marginBottom: 12, color: '#666' }}>
                    {filteredEntries.length} entr{filteredEntries.length === 1 ? 'y' : 'ies'} loaded for {this.state.selectedSourceId}
                  </div>
                )}
                {this.renderResults()}
              </Panel.Body>
            </Panel>
          </Tab>

          <Tab
            eventKey="entryForm"
            title={this.state.editingEntryId ? 'Edit Entry' : 'Add Entry'}
            disabled={!this.state.selectedSourceId}
          >
            <Panel style={{ marginTop: 12 }}>
              <Panel.Body>
                {this.renderEntryForm()}
              </Panel.Body>
            </Panel>
          </Tab>
        </Tabs>

        <Modal show={this.state.showDeleteModal} onHide={this.onCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Entry Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You are deleting entry <strong>{this.state.deleteTargetId}</strong>.
            </p>
            <p style={{ color: '#a22' }}>
              This will permanently remove the entry from the database.
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
              {this.state.deletingId === this.state.deleteTargetId ? 'Deleting...' : 'Delete Entry'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default EntriesCrud;