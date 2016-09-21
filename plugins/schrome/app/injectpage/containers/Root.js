import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';


export default class Root extends Component {

  static propTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <div>
          
          {
            (() => {
              if (process.env.DEVTOOLS) {
                const DevTools = require('./DevTools');
                return <DevTools />;
              }
            })()
          }
        </div>
      </Provider>
    );
  }
}
