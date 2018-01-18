import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import { range } from 'lodash';
import autobind from 'react-autobind';
import './App.css';
import drag from './drag.svg';

function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const springConfig = { stiffness: 300, damping: 50 };

export default class App extends Component {
  constructor(props) {
    super(props);

    const items = ['foo', 'bar', 'baz'];

    this.state = {
      topDeltaY: 0,
      mouseY: 0,
      isPressed: false,
      originalPosOfLastPressed: 0,
      order: range(items.length),
      items,
    };

    autobind(this);
  }

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  }

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  }

  handleMouseDown(pos, pressY, { pageY }) {
    this.setState({
      topDeltaY: pageY - pressY,
      mouseY: pressY,
      isPressed: true,
      originalPosOfLastPressed: pos,
    });
  }

  handleMouseMove({ pageY }) {
    const {
      isPressed, topDeltaY, order, originalPosOfLastPressed,
    } = this.state;

    if (isPressed) {
      const mouseY = pageY - topDeltaY;
      const currentRow = clamp(Math.round(mouseY / 100), 0, this.state.items.length - 1);
      let newOrder = order;

      if (currentRow !== order.indexOf(originalPosOfLastPressed)) {
        newOrder = reinsert(order, order.indexOf(originalPosOfLastPressed), currentRow);
      }

      this.setState({ mouseY, order: newOrder });
    }
  }

  handleMouseUp() {
    this.setState({ isPressed: false, topDeltaY: 0 });
  }

  randomize() {
    const order = Object.assign([], this.state.order);

    let currentIndex = order.length;
    let temporaryValue = null;
    let randomIndex = null;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = order[currentIndex];
      order[currentIndex] = order[randomIndex];
      order[randomIndex] = temporaryValue;
    }

    this.setState({ order });
  }

  render() {
    const {
      mouseY, isPressed, originalPosOfLastPressed, order,
    } = this.state;

    return (
      <div className="demo8">
        <button onClick={this.randomize}>Shake it up!</button>
        {this.state.items.map((item, i) => {
          const style =
            originalPosOfLastPressed === i && isPressed
              ? {
                  scale: spring(1.1, springConfig),
                  shadow: spring(16, springConfig),
                  y: mouseY,
                }
              : {
                  scale: spring(1, springConfig),
                  shadow: spring(1, springConfig),
                  y: spring(order.indexOf(i) * 100, springConfig),
                };
          return (
            <Motion style={style} key={i}>
              {({ scale, shadow, y }) => (
                <div
                  className="demo8-item"
                  style={{
                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    zIndex: i === originalPosOfLastPressed ? 99 : i,
                  }}
                >
                  <img
                    src={drag}
                    alt="drag icon"
                    onMouseDown={this.handleMouseDown.bind(null, i, y)}
                    onTouchStart={this.handleTouchStart.bind(null, i, y)}
                    style={{
                      maxWidth: 30,
                      display: 'inline',
                      padding: '28px 0 28px 30px',
                    }}
                  />
                  <p style={{ display: 'inline' }} className="unselectedable">
                    {item}
                  </p>
                </div>
              )}
            </Motion>
          );
        })}
      </div>
    );
  }
}
