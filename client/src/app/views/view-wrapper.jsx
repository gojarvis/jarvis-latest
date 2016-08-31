import { Component } from 'react';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';


const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#558564',
    primary2Color: 'green',
    accent1Color: '#007EA7',
  },
  appBar: {
    height: 50,
  },
});


class ViewWrapper extends Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}

export default ViewWrapper;
