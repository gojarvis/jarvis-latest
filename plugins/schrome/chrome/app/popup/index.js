import React from 'react';
import ReactDOM from 'react-dom';
import 'todomvc-app-css/index.css';
import Root from '../../../app/todoapp/containers/Root';

chrome.storage.local.get('state', (obj) => {
  const { state } = obj;
  if (Object.getPrototypeOf(state) === String.prototype) {
    window.state = JSON.parse(state);
  } else if (Object.getPrototypeOf(state) === Object.prototype) {
    window.state = state;
  }

  const createStore = require('../../../app/todoapp/store/configureStore');
  ReactDOM.render(
    <Root store={createStore()} />,
    document.querySelector('#root')
  );
});
