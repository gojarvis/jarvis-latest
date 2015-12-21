const React = require('react');

const Face = React.createClass({
  getInitialState: function(){
    return ({
      eyes: {
        right: "@",
        left: "@"
      },
      mouth: "_______",
      blinked: false
    })
  },
  componentDidMount: function(){
    this.hum();
  },

  closeEyes: function(){
    this.setState({
      eyes: {
        right: "--",
        left: "--"
      }
    })
  },
  openEyes: function(){
    this.setState({
      eyes: {
        right: "@",
        left: "@"
      }
    })
  },
  recordingEyes: function(){
    this.setState({
      eyes: {
        right: "^",
        left: "^",
        mouth: "_______"
      }
    })
  },
  blink: function(){
    let rnd = Math.random();
    if (rnd > 0.60){
      this.closeEyes();
      this.wait(rnd * 800, this.openEyes);
    }
  },
  hum: function(){
      this.wait(Math.floor(Math.random() * 4000) + 1000, function(){
        console.log("AM I RECORDING? ", this.props.recording);
        if (!this.props.recording){
          this.blink();
        }
        else{
          this.recordingEyes();
        }
        this.hum();
      }.bind(this))


  },
  wait: function(delay, func) {
    return setTimeout(func, delay);
  },

  doAndRepeat: function(delay, func) {
    func();
    return setInterval(func, delay);
  },
  render(){
    let style = {
        face: {
          eyes: {
            fontSize: "80px"
          },
          mouth: {
            fontSize: "80px"
          },
        },
        container: {
           display: "flex",
           flexDirection: "row",
           alignItems: "center",
           justifyContent: "center"
        }
    };
    return (
      <div style={{width: "100%", height: "100%", display: "block", position: "absolute"}}>
        <div style={{width: "100%", height: "40%"}}></div>
        <div style={style.container}>
          <span style={style.face.eyes}>{this.state.eyes.left}</span>
          <span style={style.face.mouth}>{this.state.mouth}</span>
          <span style={style.face.eyes}>{this.state.eyes.right}</span>
        </div>
        <div style={{width: "100%", height: "40%", flexDirection: "row", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px"}}>
          <span>{this.props.children}</span>
        </div>
      </div>
    )
  },
})


module.exports = Face;
