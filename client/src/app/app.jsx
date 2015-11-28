(function () {
  let React = require('react');
  let ReactDOM = require('react-dom');
  let injectTapEventPlugin = require('react-tap-event-plugin');
  let Main = require('./components/main.jsx'); // Our custom react component
  let io = require('socket.io-client')

  let socket = io.connect('localhost:3000', {reconnect: true});


  //Needed for React Developer Tools
  window.React = React;
  window.socket = socket;


  //Needed for onTouchTap
  //Can go away when react 1.0 release
  //Check this repo:
  //https://github.com/zilverline/react-tap-event-plugin
  injectTapEventPlugin();

  // Render the main app react component into the app div.
  // For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
  ReactDOM.render(<Main />, document.getElementById('app'));

})();
