import {Component} from 'react';
import FB from 'styles/flexbox';

class IconText extends Component {
  static displayName = 'IconText';
  render() {
    return (
      <div style={{...FB.base, ...FB.align.center, ...FB.justify.center}} onClick={this.props.onClick}>
        <span
          style={{color: this.props.iconColor || '#000', margin: this.props.margin || 5, flexBasis: 20}}
          className={'fa fa-lg fa-' + this.props.icon} />
        <span style={{flex: '1'}}>{this.props.children}</span>
      </div>
    );
  }
}

export default IconText;
