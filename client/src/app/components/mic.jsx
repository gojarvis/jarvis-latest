const React = require('react');

const Mic = React.createClass({
  getInitialState(){
    return({
      context: "not there yet",
      entities: {},
    })
  },
  componentDidMount(){
    const session = {
      audio: true,
      video: false,
    };
    let recordRTC = null;
    navigator.getUserMedia(session, function (mediaStream) {
      recordRTC = RecordRTC(MediaStream);
      recordRTC.startRecording();
    }, function(){});
    // let mic = new Wit.Microphone(document.getElementById("microphone"));
    // let self = this;
    // mic.connect("VS4GQRJAHZHC2WIYMERJKGO2ONZ6VL2R");
    // // mic.start();
    // // mic.stop();
    //
    // mic.onready = function () {
    //   console.log("Microphone is ready to record");
    // };
    //
    // mic.onaudiostart = function () {
    //   console.log("Recording started");
    //
    // };
    // mic.onaudioend = function () {
    //   console.log("Recording stopped, processing started");
    // };
    //
    // mic.onresult = function(intent, entities){
    //   self.handleResult(intent, entities);
    // };
  },
  handleResult(intent, entities){
    this.setState({context: intent, entities: entities});
  },
  render(){
    return (
      <div>
        <div style={{margin: "15px", fontSize: "12px"}} id="microphone">Mic</div>
        <div>
          <div>{this.state.context}</div>
          <div><pre>{JSON.stringify(this.state.entities, null, 2) }</pre></div>
        </div>
      </div>
    )
  },
})
// mic.onready = function () {
//   info("Microphone is ready to record");
// };
// mic.onaudiostart = function () {
//   info("Recording started");
//   error("");
// };
// mic.onaudioend = function () {
//   info("Recording stopped, processing started");
// };
// mic.onresult = function (intent, entities) {
//   console.log(intent, entities);
//   var r = kv("intent", intent);
//
//   for (var k in entities) {
//     var e = entities[k];
//
//     if (!(e instanceof Array)) {
//       r += kv(k, e.value);
//     } else {
//       for (var i = 0; i < e.length; i++) {
//         r += kv(k, e[i].value);
//       }
//     }
//   }
//
//   document.getElementById("result").innerHTML = r;
// };
// mic.onerror = function (err) {
//   error("Error: " + err);
// };
// mic.onconnecting = function () {
//   info("Microphone is connecting");
// };
// mic.ondisconnected = function () {
//   info("Microphone is not connected");
// };
//
// mic.connect("VS4GQRJAHZHC2WIYMERJKGO2ONZ6VL2R");
// // mic.start();
// // mic.stop();
//
// function kv (k, v) {
//   if (toString.call(v) !== "[object String]") {
//     v = JSON.stringify(v);
//   }
//   return k + "=" + v + "\n";
// }

module.exports = Mic;
