import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import ViewWrapper from 'views/view-wrapper';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
let agent = require('superagent-promise')(require('superagent'), Promise);

class UrlFilteringEditor extends Component {
  constructor(...args){
    super(...args);
  }


  render () {
    return (
      <div style={{margin: '10px'}}>

      </div>
    )
  }
}

export default UrlFilteringEditor
