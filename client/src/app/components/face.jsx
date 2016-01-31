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
    // this.setState({
    //   eyes: {
    //     right: "^",
    //     left: "^",
    //     mouth: "_______"
    //   }
    // })
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
        if (!this.props.recording){
          this.blink();
        }
        else{
          // this.recordingEyes();
        }
        this.hum();
      }.bind(this))


  },
  wait: function(delay, func) {
    return setTimeout(func, delay);
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
      <div>


      </div>
    )
  },
})


module.exports = Face;
