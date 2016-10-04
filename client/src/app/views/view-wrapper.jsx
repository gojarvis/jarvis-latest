import { Component } from 'react';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Sidebar from 'components/Sidebar/Sidebar'


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
      <div>
        <Sidebar />
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={styles.viewWrapper}>
            {this.props.children}
          </div>
        </MuiThemeProvider>
      </div>

    );
  }
}

export default ViewWrapper;

const styles = {
  viewWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    left: 80,
    zIndex: 10
  }
}
