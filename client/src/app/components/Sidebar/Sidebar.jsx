import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import FB from 'styles/flexbox';
import LoadingIndicator from 'components/LoadingIndicator';
let agent = require('superagent-promise')(require('superagent'), Promise);

let ReportsIcon = require('react-icons/lib/md/assistant')
let ConnectionExplorerIcon = require('react-icons/lib/fa/sitemap');
let SettingsIcon = require('react-icons/lib/md/settings-applications')
let UserIcon = require('react-icons/lib/fa/user')
let LogoutIcon = require('react-icons/lib/fa/power-off')
let AdminIcon = require('react-icons/lib/md/pan-tool')

let logoImageSrc = require('./logo.png');

class Sidebar extends Component {
  static displayName = 'Sidebar';

  constructor(){
    super();
    this.state = {
      isAdmin: false
    }
  }

  componentWillMount(){
    agent.post('http://localhost:3000/api/user/userjson').then(res => {
      if (res.body.role === 'admin'){
        this.setState({
          isAdmin: true
        })
      }
    });
  }

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

    let admin;

    if (this.state.isAdmin){
      admin = (
        <div style={styles.navbar.item.wrapper} title="Admin">
            <AdminIcon style={styles.navbar.item.content} onClick={() => this.handleNavigation('/admin')} />
        </div>
      )
    }

    return (
      <div style={styles.sidebar}>
        <div style={styles.navbar.logo}>
          <img src={logoImageSrc} height='56' width='56' />
        </div>

        <div style={styles.navbar.item.wrapper}  title="Connection Explorer">
            <ConnectionExplorerIcon style={{...styles.navbar.item.content, ...isSelected(/main/)}} onClick={() => this.handleNavigation('/main')}/>
        </div>

        <div style={styles.navbar.item.wrapper} title="Reports">
            <ReportsIcon style={{...styles.navbar.item.content, ...isSelected(/report/)}} onClick={() => this.handleNavigation('report')}/>
        </div>


        <div style={styles.navbar.item.wrapper}  title="Team Activity">
            <UserIcon style={{...styles.navbar.item.content, ...isSelected(/team/)}}/>
        </div>

        <div style={styles.navbar.item.wrapper} title="Settings">
            <SettingsIcon style={{...styles.navbar.item.content, ...isSelected(/profile/)}} onClick={() => this.handleNavigation('profile')} />
        </div>

        {admin}

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

export default Radium(Sidebar);

let isSelected = function(regex) {
  return !!regex.test(window.location.hash) ? styles.navbar.item.isSelected : null;
}

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
        width: '56px',
        margin: '0 auto',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginBottom: '10'
      },
      isSelected: {
        backgroundColor: 'rgb(98, 102, 112)'
      },
      content: {
        fontSize: '24px',
        color: '#e1e1e1',
        backgroundColor: 'rgb(62, 66, 75)',
        borderRadius: '3px',
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
