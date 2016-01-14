import React, { Component, PropTypes } from 'react';

export default class BaseComponent extends Component {
  constructor(props, context) {
    super(props, context);
  }

  static get propTypes() {
    return {
    }
  }

  static set propTypes(val) {}
}
