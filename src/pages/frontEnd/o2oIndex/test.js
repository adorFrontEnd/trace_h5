import React, { Component } from 'react'
import TestTurn from './TestTurn'
class App extends Component {
  constructor(props) {
    super(props)
    // react中获取dom元素
    this.canvas = React.createRef()
  }
  componentDidMount() {
    const canvas = this.canvas.current
    const context = canvas.getContext('2d')
    canvas.width = 300
    canvas.height = 300
    const turntable = new TestTurn({ canvas: canvas, context: context })
    // 将render替换为调用startRotate
    turntable.startRotate()
  }
  render() {
    return <canvas
      ref={this.canvas}
      style={{
        width: '300px',
        height: '300px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: ' 20px auto'
      }}>
    </canvas>
  }
}
export default App
