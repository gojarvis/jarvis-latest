import React, { Component, PropTypes } from 'react'
import FB from 'styles/flexbox';
import LoadingIndicator from 'components/LoadingIndicator';

let DashboardIcon = require('react-icons/lib/fa/dashboard');
let ConnectionExplorerIcon = require('react-icons/lib/fa/sitemap');
let SettingsIcon = require('react-icons/lib/md/settings-applications')

let logoImageSrc = require('./logo.png');

class Sidebar extends Component {
  static displayName = 'Sidebar';

  handleSidebarButtonClick() {

  }

  _handleNavigation(){
    console.log('this.context', this.context);
    this.context.router.push('/profile');
  }

  _handleFilter(filter) {
    this.props.setEndNodeType(filter.type);
  }

  render () {

    return (
      <div style={styles.sidebar}>
        <div style={styles.navbar.logo}>
          <img src={logoImageSrc} height='56' width='56' />
        </div>
        <div style={styles.navbar.item.wrapper}>
            <DashboardIcon style={styles.navbar.item.content}/>
        </div>
        <div style={styles.navbar.item.wrapper}>
            <ConnectionExplorerIcon style={styles.navbar.item.content}/>
        </div>

        <div style={styles.navbar.item.wrapper}>
            <SettingsIcon style={styles.navbar.item.content} onClick={() => this._handleNavigation()}/>
        </div>
      </div>
    )
  }
}

Sidebar.contextTypes = {
  router: PropTypes.object.isRequired
}

export default Sidebar;


const styles = {
  sidebar: {
    position: 'absolute',
    top:0,
    left:0,
    width: 80,
    bottom: 0,
    backgroundColor: 'rgb(31, 37, 48)'
  },
  navbar: {
    logo:{
      width: '70%',
      margin: '10px auto',
      backgroundColor: 'white',
      height: '55px'
    },
    item: {
      wrapper: {
        width: '80%',
        margin: '0 auto',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      },
      content: {
        fontSize: '30px',
        color: '#e1e1e1',
        backgroundColor: 'rgb(62, 66, 75)',
        padding: '13px'
      }
    }
  },
  toggle: {
    color: 'white',
    backgroundColor: 'white',
    position: 'fixed',
    bottom: 0,
    width: '100%'
  },
};
