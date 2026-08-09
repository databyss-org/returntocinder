import React from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import io from 'socket.io-client';
import LogView from '../LogView';

const { UPLOAD_URL } = process.env;

class UploadRtf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropMessage: '',
      output: [],
      running: false,
      needSnapshot: true
    };
    this.uploadUrl = `${UPLOAD_URL || '/upload'}/supplement`;
    this.socket = io({
      query: {
        adminToken: props.adminToken
      }
    });
    this.socket.on('stdout', msg => {
      console.log('stdout', msg);
      this.setState({ output: this.state.output.concat(msg) });
    });
    this.socket.on('stderr', msg => {
      console.log('stderr', msg);
      this.setState({ output: this.state.output.concat(msg.toString()) });
    });
    this.socket.on('end', success => {
      if (this.state.needSnapshot) {
        this.setState({ needSnapshot: false });
        this.processSupplement();
      } else {
        this.setState({
          running: false,
          needSnapshot: true,
          output: this.state.output.concat(success ? 'DONE' : 'IMPORT FAILED')
        });
      }
    });
    this.onDrop = this.onDrop.bind(this);
  }
  processSupplement() {
    this.socket.emit('admin', 'importsupplement', this.state.filename);
  }
  async onDrop(accepted, rejected) {
    if (accepted.length) {
      const f = accepted[0];
      const data = new FormData();
      data.append('file', f);
      this.setState({
        output: this.state.output.concat(`Uploading ${f.name}...`)
      });
      // UPLOAD THE FILE
      try {
        const res = await axios.post(this.uploadUrl, data, {
          headers: {
            Authorization: `Bearer ${this.props.adminToken}`
          }
        });
        this.setState({
          output: this.state.output.concat(`Uploaded ${f.name}`),
          filename: res.data.filename
        });
      } catch (err) {
        this.setState({
          output: this.state.output.concat(`Error uploading ${f.name}: ${err}`)
        });
      }
      // KICK OFF BACKUP
      this.setState({ running: true });
      if (this.state.needSnapshot) {
        this.socket.emit('admin', 'makesnapshot');
      } else {
        this.processSupplement();
      }
    } else if (rejected.length) {
      const f = rejected[0];
      this.setState({
        output: this.state.output.concat(`${f.name} is not a valid RTF file`)
      });
    } else {
      this.setState({
        output: this.state.output.concat('Unexpected upload error')
      });
    }
  }
  componentWillUnmount() {
    this.socket.close();
  }
  render() {
    return (
      <React.Fragment>
      <div
            style={{
              marginBottom: '14px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fafafa',
              fontSize: '14px',
              lineHeight: 1.5
            }}
          >
            <strong>Supplement file format</strong>
            <div>1. First line: <code>AUTHOR_CODE,LastName,FirstName</code></div>
            <div>2. Then one bold heading line (section title).</div>
            <div>3. Each entry line: <code>SOURCE_CODE pp. LOCATION Entry text...</code></div>
            <div>
              Use valid source codes from your bibliography.<br />
              <a href="/supplement-template.rtf" download>
                Download RTF template
              </a>
            </div>
          </div>
      <div style={{ display: 'flex', flexDirection: 'row', height: '50vh' }}>
        <div style={{ flexBasis: '50%', marginRight: '50px' }}>
          <Dropzone
            accept="text/rtf"
            onDrop={this.onDrop}
            multiple={false}
            disabled={this.state.running}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              height: '100%',
              border: '2px dotted #333',
              fontSize: '2em'
            }}
            activeStyle={{
              backgroundColor: '#ccc'
            }}
          >
            Drop the supplement rtf here
          </Dropzone>
        </div>
        <div style={{ flexBasis: '50%' }}>
          <LogView lines={this.state.output} />
        </div>
      </div>
    </React.Fragment>
    );
  }
}

export default UploadRtf;
