import { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import TransitionGroup from 'react-addons-transition-group';
import tmax from 'gsap';

class LoadingIcon extends Component {
  constructor(...args) {
    super(...args);
  }

  static displayName = 'LoadingIcon';

  componentWillEnter(callback) {
    const el = findDOMNode(this);
    tmax.fromTo(el, 0.35, {opacity: 0}, {opacity: 1, onComplete: callback});
  }

  componentWillLeave (callback) {
    const el = findDOMNode(this);
    tmax.fromTo(el, 0.35, {opacity: 1}, {opacity: 0, onComplete: callback});
  }

  render() {
    return (
      <span style={{margin: '0 10px'}}>
        <i className='fa fa-circle-o-notch fa-spin' />
      </span>
    );
  }
}

class LoadingIndicator extends Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <TransitionGroup>
        {this.props.queriedItems.isFetching && <LoadingIcon />}
      </TransitionGroup>
    );
  }
}

export default connect(
  state => ({
    eventTickerItems: state.eventTickerItems,
    queriedItems: state.queriedItems,
  })
)(LoadingIndicator);
