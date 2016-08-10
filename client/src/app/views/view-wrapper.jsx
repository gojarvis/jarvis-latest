import { Component } from 'react';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

class ViewWrapper extends Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}

export default ViewWrapper;
