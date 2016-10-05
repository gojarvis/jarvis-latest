import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import FlipMove from 'react-flip-move';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);

import moment from 'moment';

// import FileItem from './ReportItems/FileItem';
// import KeywordItem from './ReportItems/KeywordItem';
// import UrlItem from './ReportItems/UrlItem';
// import UserItem from './ReportItems/UserItem';
// import GenericItem from './ReportItems/GenericItem';



class ReportViewer extends Component {
  constructor(...args) {
    super(...args);
  }

  static get propTypes() {
    return {

    }
  }


  render() {
    let report = this.props.report;

    let data = report.data;
    let ItemComponent;

    let momentText = moment(report.timestamp).fromNow();

    // switch(report.itemType){
    //   case 'File':
    //     ItemComponent = FileComponent;
    //   break;
    //   case 'Keyword':
    //     ItemComponent = KeywordComponent;
    //   break;
    //   case 'Url':
    //     ItemComponent = UrlComponent;
    //   break;
    //   case 'User':
    //     ItemComponent = UserComponent;
    //   break;
    //   case 'GenericItem':
    //     ItemComponent = FileComponent;
    //   break;
    //
    //
    // }

    // let items = report.data.map(item => {
    //   return (
    //     <ItemComponent item={item} />
    //   )
    // })

    return (

      <Card style={{'margin': 10}}>
        <CardHeader
          title={report.title}
          subtitle={report.subtitle}
          actAsExpander={true}
          showExpandableButton={true}
        />

        <div className="reportItems">

        </div>


        <div style={{"padding" : 10, "fontSize": 10, "color": "grey"}}>
          {momentText} { report.timestamp }
        </div>
      </Card>


    );
  }
}

const styles = {

}




export default ReportViewer;
