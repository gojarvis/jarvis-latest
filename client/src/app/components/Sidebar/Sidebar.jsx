import React, { Component, PropTypes } from 'react'
import FB from 'styles/flexbox';
import LoadingIndicator from 'components/LoadingIndicator';
let agent = require('superagent-promise')(require('superagent'), Promise);

let ReportsIcon = require('react-icons/lib/md/assistant')
let ConnectionExplorerIcon = require('react-icons/lib/fa/sitemap');
let SettingsIcon = require('react-icons/lib/md/settings-applications')
let UserIcon = require('react-icons/lib/fa/user')
let LogoutIcon = require('react-icons/lib/fa/power-off')

let logoImageSrc = require('./logo.png');

class Sidebar extends Component {
  static displayName = 'Sidebar';

  handleSidebarButtonClick() {

  }

  handleNavigation(target){
    this.context.router.push(target);
  }

  logout() {
    agent.post('http://localhost:3000/logout').then((res)=> {
      this.context.router.push('/');
    });
  }

  render () {

    return (
      <div style={styles.sidebar}>
        <div style={styles.navbar.logo}>
          <img src={logoImageSrc} height='56' width='56' />
        </div>

        <div style={styles.navbar.item.wrapper}  title="Connection Explorer">
            <ConnectionExplorerIcon style={styles.navbar.item.content} onClick={() => this.handleNavigation('/main')}/>
        </div>

        <div style={styles.navbar.item.wrapper} title="Reports">
            <ReportsIcon style={styles.navbar.item.content} onClick={() => this.handleNavigation('report')}/>
        </div>


        <div style={styles.navbar.item.wrapper}  title="Team Activity">
            <UserIcon style={styles.navbar.item.content}/>
        </div>

        <div style={styles.navbar.item.wrapper} title="Settings">
            <SettingsIcon style={styles.navbar.item.content} onClick={() => this.handleNavigation('profile')} />
        </div>

        <div style={styles.navbar.logout} title="Logout">
            <LogoutIcon style={styles.navbar.item.content} onClick={() => this.logout()} />
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
    logout: {
      position: 'absolute',
      width: '80%',
      margin: '0 auto',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      marginBottom: '10',
      bottom: '6',
      left: '10%'
    },
    item: {
      wrapper: {
        width: '80%',
        margin: '0 auto',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginBottom: '10'
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
