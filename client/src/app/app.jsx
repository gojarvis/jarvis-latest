(function () {
  let React = require('react');
  let ReactDOM = require('react-dom');
  let injectTapEventPlugin = require('react-tap-event-plugin');
  let { Router, Route, Link, hashHistory } = require('react-router');
  // let Main = require('./components/main.jsx'); // Our custom react component
  let AtomView = require('./components/atom-view.jsx');
  let MainView = require('views/main-view.jsx');
  let Teams = require('./views/teams-view.jsx');
  let Login = require('./views/login-view.jsx');
  // let AuthUser = require('./views/auth-user.jsx');
  // let Face = require('./components/face.jsx'); // Our custom react component
  let io = require('socket.io-client');
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
  ReactDOM.render((
    <Router history={hashHistory}>
      <Route path="/" component={Login} />
      {/* <Route path="/authenticated" component={authUser} /> */}
      {/* <Route path="/main" component={AtomView} /> */}
      <Route path="/main" component={MainView} />
      <Route path="/teams" component={Teams} />
    </Router>
  ), document.getElementById('app'));

})();
