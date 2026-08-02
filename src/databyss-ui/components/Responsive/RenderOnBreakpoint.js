import React from 'react'
import { isMobile } from '../../lib/mediaQuery'

class RenderOnBreakpoint extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      keyCount: 0,
    }
    this.update = this.update.bind(this)
  }

  componentWillMount() {
    window.addEventListener('resize', this.update)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.update)
  }

  update() {
    const _isMobile = isMobile()
    if (this.isMobile !== _isMobile) {
      this.isMobile = _isMobile
      this.setState({ keyCount: this.state.keyCount + 1 })
    }
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children), {
      key: this.state.keyCount,
    })
  }
}

export default RenderOnBreakpoint

export const withRenderOnBreakpoint = Wrapped => props => (
  <RenderOnBreakpoint>
    <Wrapped {...props} />
  </RenderOnBreakpoint>
)
