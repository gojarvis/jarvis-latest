import React from 'react';
import {VictoryAnimation} from 'victory-animation';

export default class Test extends React.Component {
  constructor(props) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
    this.state = {
      x: 0
    };
  }
  clickHandler() {
    this.setState({
      x: this.state.x === 0 ? 150 : 0
    });
  }
  render() {
    return (
      <div style={{position: 'relative'}}>
        <button type="button" onClick={this.clickHandler}>Toggle X</button>
        <VictoryAnimation data={{x: this.state.x}}>
          {(data) => {
            return (
              <div style={{position: 'absolute', left: data.x}}>Hello?</div>
            );
          }}
        </VictoryAnimation>
      </div>
    );
  }
}
