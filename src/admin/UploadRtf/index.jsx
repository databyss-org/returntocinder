import React from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import io from 'socket.io-client';
import LogView from '../LogView';

const { UPLOAD_URL } = process.env;
const { API_ADMIN_TOKEN } = process.env;

class UploadRtf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropMessage: '',
      output: [],
      running: false,
      needSnapshot: true
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
        const res = await axios.post(`${UPLOAD_URL}/supplement`, data);
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
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
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
    );
  }
}

export default UploadRtf;
