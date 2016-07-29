import {Component} from 'react';
import FB from 'styles/flexbox';

class IconText extends Component {
  render() {
    return (
      <div style={{...FB.base, ...FB.align.center}}>
        <span style={{margin: 10, flexBasis: 20}} className={'fa fa-lg fa-' + this.props.icon} />
        <span>{this.props.children}</span>
      </div>
    );
  }
}

export default IconText;
