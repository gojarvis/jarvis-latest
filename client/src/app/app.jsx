(function () {
  let React = require('react');
  let ReactDOM = require('react-dom');
  let { Provider } = require('react-redux');
  let injectTapEventPlugin = require('react-tap-event-plugin');
  let configureStore = require('./stores/configureStore');
  let animationActions = require('./actions/animation');
  let Main = require('./components/Main'); // Our custom react component

  // let Face = require('./components/face.jsx'); // Our custom react component
  let io = require('socket.io-client')
  //
  let socket = io.connect('localhost:3000', {reconnect: true});


  //Needed for React Developer Tools
  window.React = React;
  window.socket = socket;


  //Needed for onTouchTap
  //Can go away when react 1.0 release
  //Check this repo:
  //https://github.com/zilverline/react-tap-event-plugin
  injectTapEventPlugin();

  const store = configureStore();

  // no idea what I'm dong here, just mimicking things
  // store.dispatch(animationActions.init);

  // Render the main app react component into the app div.
  // For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
  ReactDOM.render(
    <Provider store={store}>
      <Main />
    </Provider>,
    document.getElementById('app'));
})();
