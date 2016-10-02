import React, { PropTypes } from 'react'
import brain from 'brain'



class Rnn extends React.Component {
  static displayName = 'Rnn';
  
  render () {
    let net = new brain.NeuralNetwork();

    net.train([{input: { r: "a", g: "b", b: "k" }, output: { black: "abc" }},
               {input: { r: "a", g: "c", b: "k" }, output: { white: "bcd" }},
               {input: { r: "a", g: "d" ,b: "k" }, output: { white: "bla" }}]);

    let output = net.run({ r: "a", g: "b",  b: "k" });
    console.log(output)
    return (<div>Hello</div>)
  }
}

export default Rnn;
