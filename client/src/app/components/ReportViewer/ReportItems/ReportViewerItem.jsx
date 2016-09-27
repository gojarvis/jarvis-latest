import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import IconText from 'components/IconText';
import FB from 'styles/flexbox';
import imm from 'immutable';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import moment from 'moment';

class ContextViewerItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      expanded: false,
    };
  }


  render() {




    let momentText = moment(item.timestamp).fromNow();

    return (
      <div>

      </div>
    );
  }
}



const STYLES = {

}

export default ContextViewerItem;
