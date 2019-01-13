import React from 'react';
import io from 'socket.io-client';
import { Button, Panel, Well } from 'react-bootstrap';
import LogView from '../LogView';

const { DB_CLUSTER_URI_BETA } = process.env;
const { API_ADMIN_TOKEN } = process.env;

class DbActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      output: [],
      backups: []
    };
    this.socket = io({
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: API_ADMIN_TOKEN
          }
        }
      }
    });
    this.socket.on('stdout', msg => {
      this.setState({ output: this.state.output.concat(msg) });
    });
    this.socket.on('stderr', msg => {
      this.setState({ output: this.state.output.concat(msg) });
    });
    this.socket.on('end', success => {
      this.setState({ running: false });
      this.updateSnapshotMeta();
    });
    this.onDumpToBeta = this.onDumpToBeta.bind(this);
    this.onBackup = this.onBackup.bind(this);
    this.onRestore = this.onRestore.bind(this);
  }
  onDumpToBeta() {
    this.setState({ running: true });
    this.socket.emit('admin', 'dumptobeta');
  }
  onRestore() {
    this.setState({ running: true });
    this.socket.emit('admin', 'restoresnapshot');
  }
  onBackup() {
    this.setState({ running: true });
    this.socket.emit('admin', 'makesnapshot');
  }
  updateSnapshotMeta() {
    this.socket.emit('admin', 'snapshotmeta', snapshot =>
      this.setState({ backups: [snapshot] })
    );
  }
  componentDidMount() {
    this.updateSnapshotMeta();
  }
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
        <div style={{ flexBasis: '50%', paddingRight: 50 }}>
          {DB_CLUSTER_URI_BETA && (
            <Panel>
              <Panel.Heading>Dump to Beta</Panel.Heading>
              <Panel.Body>
                <Well>
                  Clones live database to beta database (overwrites contents of
                  beta database).
                </Well>
                <Button
                  bsStyle="success"
                  bsSize="large"
                  onClick={this.onDumpToBeta}
                  disabled={this.state.running}
                >
                  Start Dump
                </Button>
              </Panel.Body>
            </Panel>
          )}
          <Panel>
            <Panel.Heading>Databse Backup/Restore</Panel.Heading>
            <Panel.Body>
              {this.state.backups.map((snapshot, idx) => (
                <Well
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flexGrow: 1 }}>{snapshot.date}</div>
                  <div>
                    <Button
                      bsStyle="success"
                      bsSize="small"
                      onClick={() => this.onRestore(snapshot)}
                      disabled={this.state.running}
                    >
                      Restore
                    </Button>
                  </div>
                </Well>
              ))}
              <Button
                bsStyle="success"
                bsSize="large"
                onClick={this.onBackup}
                disabled={this.state.running}
              >
                Create Backup Now
              </Button>
            </Panel.Body>
          </Panel>
        </div>
        <div style={{ flexBasis: '50%' }}>
          <LogView lines={this.state.output} />
        </div>
      </div>
    );
  }
}

export default DbActions;
