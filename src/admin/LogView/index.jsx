import React from 'react';

class LogView extends React.Component {
  componentDidUpdate() {
    if (!this.container) {
      return;
    }
    this.container.scrollTop = 99999999;
  }
  render() {
    const { lines } = this.props;
    return (
      <div
        style={{
          overflow: 'scroll',
          height: '100%',
          width: '100%',
          backgroundColor: '#333',
          padding: '20px',
        }}
        ref={(elem) => {
          this.container = elem;
        }}
      >
        {lines.map((ln, idx) => (
          <p
            key={idx}
            style={{
              color: '#fff',
              fontFamily: 'fixed-width',
              fontSize: 'x-small'
            }}
          >
            {ln}
          </p>
        ))}
      </div>
    );
  }
}

export default LogView;
